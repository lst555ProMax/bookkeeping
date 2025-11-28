import { SleepRecord } from './types';
import { loadSleepRecords, addSleepRecord, calculateSleepDuration } from './storage';

/**
 * 睡眠记录导出数据接口
 */
export interface SleepExportData {
  version: string;
  exportDate: string;
  sleepRecords: SleepRecord[];
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
 * 验证时间格式是否为 HH:mm（格式检查，要求小时必须是两位数字）
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
 * 验证睡眠记录格式，返回详细的错误信息
 */
const validateSleepRecordWithError = (record: unknown, index: number): { valid: boolean; error?: string } => {
  // 先检查是否是null或非对象类型
  if (typeof record !== 'object' || record === null) {
    return { valid: false, error: `无效的睡眠记录[${index}]：记录必须是对象` };
  }
  
  // 检查是否是数组（数组也是object类型，但不符合要求）
  if (Array.isArray(record)) {
    return { valid: false, error: `无效的睡眠记录[${index}]：记录必须是对象` };
  }
  
  const r = record as Record<string, unknown>;
  
  // 检查必需字段是否存在
  if (!('id' in r) || r.id === undefined || r.id === null) {
    return { valid: false, error: `无效的睡眠记录[${index}]：缺少id字段` };
  }
  if (typeof r.id !== 'string') {
    return { valid: false, error: `无效的睡眠记录[${index}]：id字段类型不正确，必须是字符串` };
  }
  
  if (!('date' in r) || r.date === undefined || r.date === null) {
    return { valid: false, error: `无效的睡眠记录[${index}]：缺少date字段` };
  }
  if (typeof r.date !== 'string') {
    return { valid: false, error: `无效的睡眠记录[${index}]：date字段类型不正确，必须是字符串` };
  }
  
  if (!('sleepTime' in r) || r.sleepTime === undefined || r.sleepTime === null) {
    return { valid: false, error: `无效的睡眠记录[${index}]：缺少sleepTime字段` };
  }
  if (typeof r.sleepTime !== 'string') {
    return { valid: false, error: `无效的睡眠记录[${index}]：sleepTime字段类型不正确，必须是字符串` };
  }
  
  if (!('wakeTime' in r) || r.wakeTime === undefined || r.wakeTime === null) {
    return { valid: false, error: `无效的睡眠记录[${index}]：缺少wakeTime字段` };
  }
  if (typeof r.wakeTime !== 'string') {
    return { valid: false, error: `无效的睡眠记录[${index}]：wakeTime字段类型不正确，必须是字符串` };
  }
  
  if (!('quality' in r) || r.quality === undefined || r.quality === null) {
    return { valid: false, error: `无效的睡眠记录[${index}]：缺少quality字段` };
  }
  if (typeof r.quality !== 'number') {
    return { valid: false, error: `无效的睡眠记录[${index}]：quality字段类型不正确，必须是数字` };
  }
  
  if (!('createdAt' in r) || r.createdAt === undefined || r.createdAt === null) {
    return { valid: false, error: `无效的睡眠记录[${index}]：缺少createdAt字段` };
  }
  if (typeof r.createdAt !== 'string') {
    return { valid: false, error: `无效的睡眠记录[${index}]：createdAt字段类型不正确，必须是字符串` };
  }
  
  // 验证日期格式和值
  const dateValidation = isValidDate(r.date);
  if (!dateValidation.valid) {
    return { valid: false, error: `无效的睡眠记录[${index}]：date${dateValidation.error}` };
  }
  
  // 验证日期范围
  const dateRangeValidation = isValidDateRange(r.date);
  if (!dateRangeValidation.valid) {
    return { valid: false, error: `无效的睡眠记录[${index}]：${dateRangeValidation.error}` };
  }
  
  // 验证时间格式和范围
  const sleepTimeValidation = isValidTime(r.sleepTime);
  if (!sleepTimeValidation.valid) {
    return { valid: false, error: `无效的睡眠记录[${index}]：sleepTime${sleepTimeValidation.error}` };
  }
  
  const wakeTimeValidation = isValidTime(r.wakeTime);
  if (!wakeTimeValidation.valid) {
    return { valid: false, error: `无效的睡眠记录[${index}]：wakeTime${wakeTimeValidation.error}` };
  }
  
  // 验证quality（必须在0-100范围内）
  if (!Number.isFinite(r.quality)) {
    return { valid: false, error: `无效的睡眠记录[${index}]：quality必须是有效数字` };
  }
  
  if (r.quality < 0 || r.quality > 100) {
    return { valid: false, error: `无效的睡眠记录[${index}]：quality必须在0-100范围内` };
  }
  
  // 验证duration（如果存在，给出警告但不阻止导入，因为duration会根据sleepTime和wakeTime自动计算）
  // 注意：导入时会忽略duration字段，改为根据sleepTime和wakeTime计算
  if (r.duration !== undefined && r.duration !== null) {
    // duration字段会被忽略，不需要验证
  }
  
  // 验证naps（如果存在）
  if (r.naps !== undefined && r.naps !== null) {
    if (typeof r.naps !== 'object' || Array.isArray(r.naps)) {
      return { valid: false, error: `无效的睡眠记录[${index}]：naps必须是对象` };
    }
    const naps = r.naps as Record<string, unknown>;
    const validNapsKeys = ['morning', 'noon', 'afternoon', 'evening'];
    for (const key in naps) {
      if (!validNapsKeys.includes(key)) {
        return { valid: false, error: `无效的睡眠记录[${index}]：naps包含无效的键"${key}"` };
      }
      if (typeof naps[key] !== 'boolean') {
        return { valid: false, error: `无效的睡眠记录[${index}]：naps.${key}必须是布尔值` };
      }
    }
  }
  
  // 验证notes（如果存在）
  if (r.notes !== undefined && r.notes !== null) {
    if (typeof r.notes !== 'string') {
      return { valid: false, error: `无效的睡眠记录[${index}]：notes必须是字符串` };
    }
    if (r.notes.length > 50) {
      return { valid: false, error: `无效的睡眠记录[${index}]：notes长度不能超过50个字符` };
    }
  }
  
  // 验证createdAt是有效的日期字符串
  const createdAt = new Date(r.createdAt);
  if (!(createdAt instanceof Date) || isNaN(createdAt.getTime())) {
    return { valid: false, error: `无效的睡眠记录[${index}]：createdAt必须是有效的日期字符串` };
  }
  
  return { valid: true };
};

/**
 * 验证导出数据格式，返回详细的错误信息
 */
const validateSleepExportDataWithError = (data: unknown): { valid: boolean; error?: string } => {
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
  
  // 检查sleepRecords数组
  if (!Array.isArray(d.sleepRecords)) {
    return { valid: false, error: '无效的数据格式：sleepRecords必须是数组' };
  }
  
  // 验证totalRecords与实际数组长度一致
  if (d.totalRecords !== d.sleepRecords.length) {
    return { valid: false, error: `无效的数据格式：totalRecords(${d.totalRecords})与sleepRecords数组长度(${d.sleepRecords.length})不一致` };
  }
  
  // 验证每个记录
  for (let i = 0; i < d.sleepRecords.length; i++) {
    const validation = validateSleepRecordWithError(d.sleepRecords[i], i);
    if (!validation.valid) {
      return validation;
    }
  }
  
  // 检查ID重复
  const ids = new Set<string>();
  for (let i = 0; i < d.sleepRecords.length; i++) {
    const record = d.sleepRecords[i] as Record<string, unknown>;
    const id = record.id as string;
    if (ids.has(id)) {
      return { valid: false, error: `无效的数据格式：存在重复的记录ID"${id}"` };
    }
    ids.add(id);
  }
  
  // 检查同一日期是否有重复记录
  const dates = new Set<string>();
  for (let i = 0; i < d.sleepRecords.length; i++) {
    const record = d.sleepRecords[i] as Record<string, unknown>;
    const date = record.date as string;
    if (dates.has(date)) {
      return { valid: false, error: `无效的数据格式：存在重复的日期"${date}"，同一日期只能有一条睡眠记录` };
    }
    dates.add(date);
  }
  
  return { valid: true };
};

/**
 * 导出睡眠记录到JSON文件
 */
export const exportSleepRecords = (records?: SleepRecord[]): void => {
  try {
    const sleepRecords = records || loadSleepRecords();
    
    const exportData: SleepExportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      sleepRecords,
      totalRecords: sleepRecords.length
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    link.download = `sleep-records-export-${dateStr}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`成功导出 ${sleepRecords.length} 条睡眠记录`);
  } catch (error) {
    console.error('导出睡眠记录失败:', error);
    throw new Error('导出睡眠记录失败，请重试');
  }
};

/**
 * 从JSON文件导入睡眠记录
 */
export const importSleepRecords = (file: File): Promise<{
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
          const validation = validateSleepExportDataWithError(parsedData);
          if (!validation.valid) {
            throw new Error(validation.error || '无效的数据格式：文件格式与导出格式不一致，请确保使用正确的导出文件');
          }
          
          const importData = parsedData as SleepExportData;
          
          const existingRecords = loadSleepRecords();
          const existingIds = new Set(existingRecords.map(record => record.id));
          const existingDates = new Set(existingRecords.map(record => record.date));
          
          let imported = 0;
          let skipped = 0;
          
          importData.sleepRecords.forEach(record => {
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
            
            // 转换createdAt字符串为Date对象，并计算duration（忽略导入的duration字段）
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { duration, ...recordWithoutDuration } = record;
            const calculatedDuration = calculateSleepDuration(record.sleepTime, record.wakeTime);
            
            const recordToAdd: SleepRecord = {
              ...recordWithoutDuration,
              duration: calculatedDuration,
              createdAt: new Date(record.createdAt)
            };
            
            addSleepRecord(recordToAdd);
            existingDates.add(record.date); // 更新已存在的日期集合
            imported++;
          });
          
          resolve({
            imported,
            skipped,
            total: importData.sleepRecords.length
          });
          
          console.log(`导入完成: ${imported} 条新记录 (${skipped} 条跳过)`);
        } catch (error) {
          console.error('导入睡眠记录失败:', error);
          reject(error instanceof Error ? error : new Error('导入睡眠记录失败，请重试'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('导入睡眠记录失败:', error);
      reject(new Error('导入睡眠记录失败，请重试'));
    }
  });
};

/**
 * 验证睡眠记录导入文件格式
 */
export const validateSleepImportFile = (file: File): string | null => {
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    return '请选择JSON格式的文件';
  }
  
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return '文件大小不能超过10MB';
  }
  
  return null;
};
