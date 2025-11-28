import { DailyRecord, MealStatus } from './types';
import { loadDailyRecords, addDailyRecord } from './storage';

/**
 * 日常记录导出数据接口
 */
export interface DailyExportData {
  version: string;
  exportDate: string;
  dailyRecords: DailyRecord[];
  totalRecords: number;
}

/**
 * 验证日期格式是否为 YYYY-MM-DD，并检查日期值是否有效
 */
const isValidDate = (dateStr: string): { valid: boolean; error?: string } => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    return { valid: false, error: '格式不正确，必须是YYYY-MM-DD格式' };
  }
  
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return { valid: false, error: '格式不正确，必须是YYYY-MM-DD格式' };
  }
  
  // 检查月份是否在1-12之间
  if (month < 1 || month > 12) {
    return { valid: false, error: `月份值${month}无效，必须在1-12之间` };
  }
  
  // 检查日期是否在1-31之间（粗略检查）
  if (day < 1 || day > 31) {
    return { valid: false, error: `日期值${day}无效，必须在1-31之间` };
  }
  
  // 使用Date对象进一步验证日期是否有效（处理2月29日等情况）
  const date = new Date(dateStr);
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return { valid: false, error: '日期值无效' };
  }
  
  // 验证解析后的日期是否与输入一致（防止"2025-13-45"被解析为其他日期）
  const parsedYear = date.getFullYear();
  const parsedMonth = date.getMonth() + 1;
  const parsedDay = date.getDate();
  
  if (parsedYear !== year || parsedMonth !== month || parsedDay !== day) {
    return { valid: false, error: '日期值无效' };
  }
  
  return { valid: true };
};

/**
 * 验证日期范围：不能早于2025年10月1日，不能大于当天
 */
const isValidDateRange = (dateStr: string): { valid: boolean; error?: string } => {
  const date = new Date(dateStr);
  const minDate = new Date('2025-10-01');
  const today = new Date();
  today.setHours(23, 59, 59, 999); // 设置为今天的最后一刻
  
  if (date < minDate) {
    return { valid: false, error: '日期不能早于2025年10月1日' };
  }
  
  if (date > today) {
    return { valid: false, error: '日期不能大于今天' };
  }
  
  return { valid: true };
};

/**
 * 验证时间格式是否为 HH:mm（格式检查）
 */
const isValidTimeFormat = (timeStr: string): boolean => {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeStr);
};

/**
 * 验证时间值是否在有效范围内（值检查）
 */
const isValidTimeRange = (timeStr: string): { valid: boolean; error?: string } => {
  const parts = timeStr.split(':');
  if (parts.length !== 2) {
    return { valid: false, error: '时间格式不正确' };
  }
  
  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);
  
  if (isNaN(hour) || isNaN(minute)) {
    return { valid: false, error: '时间格式不正确' };
  }
  
  if (hour < 0 || hour > 23) {
    return { valid: false, error: `小时值${hour}超出范围，必须在0-23之间` };
  }
  
  if (minute < 0 || minute > 59) {
    return { valid: false, error: `分钟值${minute}超出范围，必须在0-59之间` };
  }
  
  return { valid: true };
};

/**
 * 验证时间格式是否为 HH:mm（完整验证）
 */
const isValidTime = (timeStr: string): { valid: boolean; error?: string } => {
  // 先检查格式
  if (!isValidTimeFormat(timeStr)) {
    return { valid: false, error: '格式不正确，必须是HH:mm格式' };
  }
  
  // 再检查值范围
  return isValidTimeRange(timeStr);
};

/**
 * 验证MealStatus是否为有效值
 */
const isValidMealStatus = (status: string): status is MealStatus => {
  return Object.values(MealStatus).includes(status as MealStatus);
};

/**
 * 验证日常记录格式，返回详细的错误信息
 */
const validateDailyRecordWithError = (record: unknown, index: number): { valid: boolean; error?: string } => {
  // 先检查是否是null或非对象类型
  if (typeof record !== 'object' || record === null) {
    return { valid: false, error: `无效的日常记录[${index}]：记录必须是对象` };
  }
  
  // 检查是否是数组（数组也是object类型，但不符合要求）
  if (Array.isArray(record)) {
    return { valid: false, error: `无效的日常记录[${index}]：记录必须是对象` };
  }
  
  const r = record as Record<string, unknown>;
  
  // 检查必需字段是否存在
  if (!('id' in r) || r.id === undefined || r.id === null) {
    return { valid: false, error: `无效的日常记录[${index}]：缺少id字段` };
  }
  if (typeof r.id !== 'string') {
    return { valid: false, error: `无效的日常记录[${index}]：id字段类型不正确，必须是字符串` };
  }
  
  if (!('date' in r) || r.date === undefined || r.date === null) {
    return { valid: false, error: `无效的日常记录[${index}]：缺少date字段` };
  }
  if (typeof r.date !== 'string') {
    return { valid: false, error: `无效的日常记录[${index}]：date字段类型不正确，必须是字符串` };
  }
  
  if (!('meals' in r) || r.meals === undefined || r.meals === null) {
    return { valid: false, error: `无效的日常记录[${index}]：缺少meals字段` };
  }
  if (typeof r.meals !== 'object' || Array.isArray(r.meals)) {
    return { valid: false, error: `无效的日常记录[${index}]：meals字段类型不正确，必须是对象` };
  }
  
  if (!('hygiene' in r) || r.hygiene === undefined || r.hygiene === null) {
    return { valid: false, error: `无效的日常记录[${index}]：缺少hygiene字段` };
  }
  if (typeof r.hygiene !== 'object' || Array.isArray(r.hygiene)) {
    return { valid: false, error: `无效的日常记录[${index}]：hygiene字段类型不正确，必须是对象` };
  }
  
  if (!('bathing' in r) || r.bathing === undefined || r.bathing === null) {
    return { valid: false, error: `无效的日常记录[${index}]：缺少bathing字段` };
  }
  if (typeof r.bathing !== 'object' || Array.isArray(r.bathing)) {
    return { valid: false, error: `无效的日常记录[${index}]：bathing字段类型不正确，必须是对象` };
  }
  
  if (!('laundry' in r) || r.laundry === undefined || r.laundry === null) {
    return { valid: false, error: `无效的日常记录[${index}]：缺少laundry字段` };
  }
  if (typeof r.laundry !== 'boolean') {
    return { valid: false, error: `无效的日常记录[${index}]：laundry字段类型不正确，必须是布尔值` };
  }
  
  if (!('cleaning' in r) || r.cleaning === undefined || r.cleaning === null) {
    return { valid: false, error: `无效的日常记录[${index}]：缺少cleaning字段` };
  }
  if (typeof r.cleaning !== 'boolean') {
    return { valid: false, error: `无效的日常记录[${index}]：cleaning字段类型不正确，必须是布尔值` };
  }
  
  if (!('createdAt' in r) || r.createdAt === undefined || r.createdAt === null) {
    return { valid: false, error: `无效的日常记录[${index}]：缺少createdAt字段` };
  }
  if (typeof r.createdAt !== 'string') {
    return { valid: false, error: `无效的日常记录[${index}]：createdAt字段类型不正确，必须是字符串` };
  }
  
  // 验证日期格式和值
  const dateValidation = isValidDate(r.date);
  if (!dateValidation.valid) {
    return { valid: false, error: `无效的日常记录[${index}]：date${dateValidation.error}` };
  }
  
  // 验证日期范围
  const dateRangeValidation = isValidDateRange(r.date);
  if (!dateRangeValidation.valid) {
    return { valid: false, error: `无效的日常记录[${index}]：${dateRangeValidation.error}` };
  }
  
  // 验证meals对象
  const meals = r.meals as Record<string, unknown>;
  if (typeof meals.breakfast !== 'string' || !isValidMealStatus(meals.breakfast)) {
    return { valid: false, error: `无效的日常记录[${index}]：meals.breakfast必须是有效的MealStatus值` };
  }
  
  if (typeof meals.lunch !== 'string' || !isValidMealStatus(meals.lunch)) {
    return { valid: false, error: `无效的日常记录[${index}]：meals.lunch必须是有效的MealStatus值` };
  }
  
  if (typeof meals.dinner !== 'string' || !isValidMealStatus(meals.dinner)) {
    return { valid: false, error: `无效的日常记录[${index}]：meals.dinner必须是有效的MealStatus值` };
  }
  
  // 验证hygiene对象
  const hygiene = r.hygiene as Record<string, unknown>;
  if (typeof hygiene.morningWash !== 'boolean') {
    return { valid: false, error: `无效的日常记录[${index}]：hygiene.morningWash必须是布尔值` };
  }
  
  if (typeof hygiene.nightWash !== 'boolean') {
    return { valid: false, error: `无效的日常记录[${index}]：hygiene.nightWash必须是布尔值` };
  }
  
  // 验证bathing对象
  const bathing = r.bathing as Record<string, unknown>;
  if (typeof bathing.shower !== 'boolean') {
    return { valid: false, error: `无效的日常记录[${index}]：bathing.shower必须是布尔值` };
  }
  
  if (typeof bathing.hairWash !== 'boolean') {
    return { valid: false, error: `无效的日常记录[${index}]：bathing.hairWash必须是布尔值` };
  }
  
  if (typeof bathing.footWash !== 'boolean') {
    return { valid: false, error: `无效的日常记录[${index}]：bathing.footWash必须是布尔值` };
  }
  
  if (typeof bathing.faceWash !== 'boolean') {
    return { valid: false, error: `无效的日常记录[${index}]：bathing.faceWash必须是布尔值` };
  }
  
  // 验证wechatSteps（如果存在，范围0-100000）
  if (r.wechatSteps !== undefined && r.wechatSteps !== null) {
    if (typeof r.wechatSteps !== 'number') {
      return { valid: false, error: `无效的日常记录[${index}]：wechatSteps必须是数字` };
    }
    if (!Number.isFinite(r.wechatSteps)) {
      return { valid: false, error: `无效的日常记录[${index}]：wechatSteps必须是有效数字` };
    }
    if (!Number.isInteger(r.wechatSteps) || r.wechatSteps < 0) {
      return { valid: false, error: `无效的日常记录[${index}]：wechatSteps必须是非负整数` };
    }
    if (r.wechatSteps > 100000) {
      return { valid: false, error: `无效的日常记录[${index}]：wechatSteps不能超过100000` };
    }
  }
  
  // 验证checkInTime（如果存在）
  if (r.checkInTime !== undefined && r.checkInTime !== null) {
    if (typeof r.checkInTime !== 'string') {
      return { valid: false, error: `无效的日常记录[${index}]：checkInTime字段类型不正确，必须是字符串` };
    }
    const checkInTimeValidation = isValidTime(r.checkInTime);
    if (!checkInTimeValidation.valid) {
      return { valid: false, error: `无效的日常记录[${index}]：checkInTime${checkInTimeValidation.error}` };
    }
  }
  
  // 验证checkOutTime（如果存在）
  if (r.checkOutTime !== undefined && r.checkOutTime !== null) {
    if (typeof r.checkOutTime !== 'string') {
      return { valid: false, error: `无效的日常记录[${index}]：checkOutTime字段类型不正确，必须是字符串` };
    }
    const checkOutTimeValidation = isValidTime(r.checkOutTime);
    if (!checkOutTimeValidation.valid) {
      return { valid: false, error: `无效的日常记录[${index}]：checkOutTime${checkOutTimeValidation.error}` };
    }
  }
  
  // 验证leaveTime（如果存在）
  if (r.leaveTime !== undefined && r.leaveTime !== null) {
    if (typeof r.leaveTime !== 'string') {
      return { valid: false, error: `无效的日常记录[${index}]：leaveTime字段类型不正确，必须是字符串` };
    }
    const leaveTimeValidation = isValidTime(r.leaveTime);
    if (!leaveTimeValidation.valid) {
      return { valid: false, error: `无效的日常记录[${index}]：leaveTime${leaveTimeValidation.error}` };
    }
  }
  
  // 验证notes（如果存在）
  if (r.notes !== undefined && r.notes !== null) {
    if (typeof r.notes !== 'string') {
      return { valid: false, error: `无效的日常记录[${index}]：notes必须是字符串` };
    }
    if (r.notes.length > 50) {
      return { valid: false, error: `无效的日常记录[${index}]：notes长度不能超过50个字符` };
    }
  }
  
  // 验证createdAt是有效的日期字符串
  const createdAt = new Date(r.createdAt);
  if (!(createdAt instanceof Date) || isNaN(createdAt.getTime())) {
    return { valid: false, error: `无效的日常记录[${index}]：createdAt必须是有效的日期字符串` };
  }
  
  return { valid: true };
};

/**
 * 验证导出数据格式，返回详细的错误信息
 */
const validateDailyExportDataWithError = (data: unknown): { valid: boolean; error?: string } => {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, error: '无效的数据格式：数据必须是JSON对象' };
  }
  
  const d = data as Record<string, unknown>;
  
  // 检查顶层字段
  if (typeof d.version !== 'string') {
    return { valid: false, error: '无效的数据格式：缺少version字段或类型不正确' };
  }
  
  if (typeof d.exportDate !== 'string') {
    return { valid: false, error: '无效的数据格式：缺少exportDate字段或类型不正确' };
  }
  
  if (typeof d.totalRecords !== 'number') {
    return { valid: false, error: '无效的数据格式：缺少totalRecords字段或类型不正确' };
  }
  
  // 检查dailyRecords数组
  if (!Array.isArray(d.dailyRecords)) {
    return { valid: false, error: '无效的数据格式：dailyRecords必须是数组' };
  }
  
  // 验证totalRecords与实际数组长度一致
  if (d.totalRecords !== d.dailyRecords.length) {
    return { valid: false, error: `无效的数据格式：totalRecords(${d.totalRecords})与dailyRecords数组长度(${d.dailyRecords.length})不一致` };
  }
  
  // 验证每个记录
  for (let i = 0; i < d.dailyRecords.length; i++) {
    const validation = validateDailyRecordWithError(d.dailyRecords[i], i);
    if (!validation.valid) {
      return validation;
    }
  }
  
  // 检查ID重复
  const ids = new Set<string>();
  for (let i = 0; i < d.dailyRecords.length; i++) {
    const record = d.dailyRecords[i];
    if (typeof record !== 'object' || record === null || Array.isArray(record)) {
      continue; // 已经在validateDailyRecordWithError中检查过了
    }
    const r = record as Record<string, unknown>;
    const id = r.id as string;
    if (ids.has(id)) {
      return { valid: false, error: `无效的数据格式：存在重复的记录ID"${id}"` };
    }
    ids.add(id);
  }
  
  // 检查同一日期是否有重复记录
  const dates = new Set<string>();
  for (let i = 0; i < d.dailyRecords.length; i++) {
    const record = d.dailyRecords[i];
    if (typeof record !== 'object' || record === null || Array.isArray(record)) {
      continue; // 已经在validateDailyRecordWithError中检查过了
    }
    const r = record as Record<string, unknown>;
    const date = r.date as string;
    if (dates.has(date)) {
      return { valid: false, error: `无效的数据格式：存在重复的日期"${date}"，同一日期只能有一条日常记录` };
    }
    dates.add(date);
  }
  
  return { valid: true };
};

/**
 * 导出日常记录到JSON文件
 */
export const exportDailyRecords = (records?: DailyRecord[]): void => {
  try {
    const dailyRecords = records || loadDailyRecords();
    
    const exportData: DailyExportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      dailyRecords,
      totalRecords: dailyRecords.length
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    link.download = `daily-records-export-${dateStr}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`成功导出 ${dailyRecords.length} 条日常记录`);
  } catch (error) {
    console.error('导出日常记录失败:', error);
    throw new Error('导出日常记录失败，请重试');
  }
};

/**
 * 从JSON文件导入日常记录
 */
export const importDailyRecords = (file: File): Promise<{
  imported: number;
  skipped: number;
  total: number;
}> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          let parsedData: unknown;
          
          try {
            parsedData = JSON.parse(content);
          } catch {
            throw new Error('文件格式错误：无法解析JSON，请确保文件是有效的JSON格式');
          }
          
          // 严格验证数据格式
          const validation = validateDailyExportDataWithError(parsedData);
          if (!validation.valid) {
            throw new Error(validation.error || '无效的数据格式：文件格式与导出格式不一致，请确保使用正确的导出文件');
          }
          
          const importData = parsedData as DailyExportData;
          
          const existingRecords = loadDailyRecords();
          const existingIds = new Set(existingRecords.map(record => record.id));
          const existingDates = new Set(existingRecords.map(record => record.date));
          
          let imported = 0;
          let skipped = 0;
          
          importData.dailyRecords.forEach(record => {
            // 检查是否已存在（按ID）
            if (existingIds.has(record.id)) {
              skipped++;
              return;
            }
            
            // 检查是否已存在（按日期）
            if (existingDates.has(record.date)) {
              skipped++;
              return;
            }
            
            // 转换createdAt字符串为Date对象
            const recordToAdd: DailyRecord = {
              ...record,
              createdAt: new Date(record.createdAt)
            };
            
            addDailyRecord(recordToAdd);
            existingDates.add(record.date); // 更新已存在的日期集合
            imported++;
          });
          
          resolve({
            imported,
            skipped,
            total: importData.dailyRecords.length
          });
          
          console.log(`导入完成: ${imported} 条新记录 (${skipped} 条跳过)`);
        } catch (error) {
          console.error('导入日常记录失败:', error);
          reject(error instanceof Error ? error : new Error('导入日常记录失败，请重试'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('导入日常记录失败:', error);
      reject(new Error('导入日常记录失败，请重试'));
    }
  });
};

/**
 * 验证日常记录导入文件格式
 */
export const validateDailyImportFile = (file: File): string | null => {
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    return '请选择JSON格式的文件';
  }
  
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return '文件大小不能超过10MB';
  }
  
  return null;
};
