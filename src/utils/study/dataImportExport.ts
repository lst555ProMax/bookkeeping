// 学习记录导入导出功能
import { StudyRecord } from './types';
import { loadStudyRecords, addStudyRecord } from './storage';
import { getStudyCategories, addStudyCategory } from './category';

/**
 * 学习记录导出数据接口
 */
export interface StudyExportData {
  version: string;
  exportDate: string;
  recordCount: number;
  records: StudyRecord[];
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
 * 验证学习记录格式，返回详细的错误信息
 */
const validateStudyRecordWithError = (record: unknown, index: number): { valid: boolean; error?: string } => {
  // 先检查是否是null或非对象类型
  if (typeof record !== 'object' || record === null) {
    return { valid: false, error: `无效的学习记录[${index}]：记录必须是对象` };
  }
  
  // 检查是否是数组（数组也是object类型，但不符合要求）
  if (Array.isArray(record)) {
    return { valid: false, error: `无效的学习记录[${index}]：记录必须是对象` };
  }
  
  const r = record as Record<string, unknown>;
  
  // 检查必需字段是否存在
  if (!('id' in r) || r.id === undefined || r.id === null) {
    return { valid: false, error: `无效的学习记录[${index}]：缺少id字段` };
  }
  if (typeof r.id !== 'string') {
    return { valid: false, error: `无效的学习记录[${index}]：id字段类型不正确，必须是字符串` };
  }
  
  if (!('date' in r) || r.date === undefined || r.date === null) {
    return { valid: false, error: `无效的学习记录[${index}]：缺少date字段` };
  }
  if (typeof r.date !== 'string') {
    return { valid: false, error: `无效的学习记录[${index}]：date字段类型不正确，必须是字符串` };
  }
  
  if (!('category' in r) || r.category === undefined || r.category === null) {
    return { valid: false, error: `无效的学习记录[${index}]：缺少category字段` };
  }
  if (typeof r.category !== 'string') {
    return { valid: false, error: `无效的学习记录[${index}]：category字段类型不正确，必须是字符串` };
  }
  
  if (!('videoTitle' in r) || r.videoTitle === undefined || r.videoTitle === null) {
    return { valid: false, error: `无效的学习记录[${index}]：缺少videoTitle字段` };
  }
  if (typeof r.videoTitle !== 'string') {
    return { valid: false, error: `无效的学习记录[${index}]：videoTitle字段类型不正确，必须是字符串` };
  }
  
  if (!('episodeStart' in r) || r.episodeStart === undefined || r.episodeStart === null) {
    return { valid: false, error: `无效的学习记录[${index}]：缺少episodeStart字段` };
  }
  if (typeof r.episodeStart !== 'number') {
    return { valid: false, error: `无效的学习记录[${index}]：episodeStart字段类型不正确，必须是数字` };
  }
  
  if (!('episodeEnd' in r) || r.episodeEnd === undefined || r.episodeEnd === null) {
    return { valid: false, error: `无效的学习记录[${index}]：缺少episodeEnd字段` };
  }
  if (typeof r.episodeEnd !== 'number') {
    return { valid: false, error: `无效的学习记录[${index}]：episodeEnd字段类型不正确，必须是数字` };
  }
  
  if (!('totalTime' in r) || r.totalTime === undefined || r.totalTime === null) {
    return { valid: false, error: `无效的学习记录[${index}]：缺少totalTime字段` };
  }
  if (typeof r.totalTime !== 'number') {
    return { valid: false, error: `无效的学习记录[${index}]：totalTime字段类型不正确，必须是数字` };
  }
  
  if (!('createdAt' in r) || r.createdAt === undefined || r.createdAt === null) {
    return { valid: false, error: `无效的学习记录[${index}]：缺少createdAt字段` };
  }
  if (typeof r.createdAt !== 'string') {
    return { valid: false, error: `无效的学习记录[${index}]：createdAt字段类型不正确，必须是字符串` };
  }
  
  if (!('updatedAt' in r) || r.updatedAt === undefined || r.updatedAt === null) {
    return { valid: false, error: `无效的学习记录[${index}]：缺少updatedAt字段` };
  }
  if (typeof r.updatedAt !== 'string') {
    return { valid: false, error: `无效的学习记录[${index}]：updatedAt字段类型不正确，必须是字符串` };
  }
  
  // 验证日期格式和值
  const dateValidation = isValidDate(r.date);
  if (!dateValidation.valid) {
    return { valid: false, error: `无效的学习记录[${index}]：date${dateValidation.error}` };
  }
  
  // 验证日期范围
  const dateRangeValidation = isValidDateRange(r.date);
  if (!dateRangeValidation.valid) {
    return { valid: false, error: `无效的学习记录[${index}]：${dateRangeValidation.error}` };
  }
  
  // 验证分类（不能为空）
  if (typeof r.category !== 'string' || r.category.trim().length === 0) {
    return { valid: false, error: `无效的学习记录[${index}]：category不能为空` };
  }
  
  // 验证视频标题（不能为空）
  if (typeof r.videoTitle !== 'string' || r.videoTitle.trim().length === 0) {
    return { valid: false, error: `无效的学习记录[${index}]：videoTitle不能为空` };
  }
  
  if (r.videoTitle.length > 30) {
    return { valid: false, error: `无效的学习记录[${index}]：videoTitle长度不能超过30个字符` };
  }
  
  // 验证episodeStart（必须是非负整数，范围0-1000）
  if (!Number.isFinite(r.episodeStart)) {
    return { valid: false, error: `无效的学习记录[${index}]：episodeStart必须是有效数字` };
  }
  
  if (!Number.isInteger(r.episodeStart) || r.episodeStart < 0) {
    return { valid: false, error: `无效的学习记录[${index}]：episodeStart必须是非负整数` };
  }
  
  if (r.episodeStart > 1000) {
    return { valid: false, error: `无效的学习记录[${index}]：episodeStart不能超过1000` };
  }
  
  // 验证episodeEnd（必须是非负整数，范围0-1000）
  if (!Number.isFinite(r.episodeEnd)) {
    return { valid: false, error: `无效的学习记录[${index}]：episodeEnd必须是有效数字` };
  }
  
  if (!Number.isInteger(r.episodeEnd) || r.episodeEnd < 0) {
    return { valid: false, error: `无效的学习记录[${index}]：episodeEnd必须是非负整数` };
  }
  
  if (r.episodeEnd > 1000) {
    return { valid: false, error: `无效的学习记录[${index}]：episodeEnd不能超过1000` };
  }
  
  // 验证episodeStart <= episodeEnd
  if (r.episodeStart > r.episodeEnd) {
    return { valid: false, error: `无效的学习记录[${index}]：episodeStart(${r.episodeStart})不能大于episodeEnd(${r.episodeEnd})` };
  }
  
  // 验证totalTime（范围1-1440）
  if (!Number.isFinite(r.totalTime)) {
    return { valid: false, error: `无效的学习记录[${index}]：totalTime必须是有效数字` };
  }
  
  if (r.totalTime < 1) {
    return { valid: false, error: `无效的学习记录[${index}]：totalTime必须大于等于1` };
  }
  
  if (r.totalTime > 1440) {
    return { valid: false, error: `无效的学习记录[${index}]：totalTime不能超过1440分钟（24小时）` };
  }
  
  // 验证remark（如果存在）
  if (r.remark !== undefined && r.remark !== null) {
    if (typeof r.remark !== 'string') {
      return { valid: false, error: `无效的学习记录[${index}]：remark必须是字符串` };
    }
    if (r.remark.length > 50) {
      return { valid: false, error: `无效的学习记录[${index}]：remark长度不能超过50个字符` };
    }
  }
  
  // 验证createdAt是有效的日期字符串
  const createdAt = new Date(r.createdAt);
  if (!(createdAt instanceof Date) || isNaN(createdAt.getTime())) {
    return { valid: false, error: `无效的学习记录[${index}]：createdAt必须是有效的日期字符串` };
  }
  
  // 验证updatedAt是有效的日期字符串
  const updatedAt = new Date(r.updatedAt);
  if (!(updatedAt instanceof Date) || isNaN(updatedAt.getTime())) {
    return { valid: false, error: `无效的学习记录[${index}]：updatedAt必须是有效的日期字符串` };
  }
  
  return { valid: true };
};

/**
 * 验证导出数据格式，返回详细的错误信息
 */
const validateStudyExportDataWithError = (data: unknown): { valid: boolean; error?: string } => {
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
  
  if (typeof d.recordCount !== 'number') {
    return { valid: false, error: '无效的数据格式：缺少recordCount字段或类型不正确' };
  }
  
  // 检查records数组
  if (!Array.isArray(d.records)) {
    return { valid: false, error: '无效的数据格式：records必须是数组' };
  }
  
  // 验证recordCount与实际数组长度一致
  if (d.recordCount !== d.records.length) {
    return { valid: false, error: `无效的数据格式：recordCount(${d.recordCount})与records数组长度(${d.records.length})不一致` };
  }
  
  // 验证每个记录
  for (let i = 0; i < d.records.length; i++) {
    const validation = validateStudyRecordWithError(d.records[i], i);
    if (!validation.valid) {
      return validation;
    }
  }
  
  // 检查ID重复
  const ids = new Set<string>();
  for (let i = 0; i < d.records.length; i++) {
    const record = d.records[i];
    if (typeof record !== 'object' || record === null || Array.isArray(record)) {
      continue; // 已经在validateStudyRecordWithError中检查过了
    }
    const r = record as Record<string, unknown>;
    const id = r.id as string;
    if (ids.has(id)) {
      return { valid: false, error: `无效的数据格式：存在重复的记录ID"${id}"` };
    }
    ids.add(id);
  }
  
  return { valid: true };
};

/**
 * 导出学习记录为 JSON 文件
 */
export const exportStudyRecords = (records?: StudyRecord[]): void => {
  const dataToExport = records || loadStudyRecords();
  
  const exportData: StudyExportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    recordCount: dataToExport.length,
    records: dataToExport
  };
  
  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `study_records_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * 验证导入文件
 */
export const validateStudyImportFile = (file: File): string | null => {
  // 检查文件类型
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    return '请选择 JSON 格式的文件';
  }
  
  // 检查文件大小（限制为 10MB）
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return '文件大小超过限制（最大 10MB）';
  }
  
  return null;
};

/**
 * 导入学习记录
 */
export const importStudyRecords = (file: File): Promise<{
  imported: number;
  skipped: number;
  total: number;
}> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          let parsedData: unknown;
          
          try {
            parsedData = JSON.parse(content);
          } catch {
            throw new Error('文件格式错误：无法解析JSON，请确保文件是有效的JSON格式');
          }
          
          // 严格验证数据格式
          const validation = validateStudyExportDataWithError(parsedData);
          if (!validation.valid) {
            throw new Error(validation.error || '无效的数据格式：文件格式与导出格式不一致，请确保使用正确的导出文件');
          }
          
          const importData = parsedData as StudyExportData;
          
          // 检查缺失的分类
          const currentCategories = getStudyCategories();
          const missingCategories = new Set<string>();
          
          importData.records.forEach((record) => {
            if (record.category && !currentCategories.includes(record.category)) {
              missingCategories.add(record.category);
            }
          });
          
          // 如果有缺失的分类，提示用户
          if (missingCategories.size > 0) {
            let message = '导入的数据中有以下学习分类没有创建：\n\n';
            message += Array.from(missingCategories).join('、') + '\n';
            message += '\n是否创建这些分类并继续导入？';
            
            const userConfirmed = window.confirm(message);
            
            if (!userConfirmed) {
              reject(new Error('用户取消导入'));
              return;
            }
            
            missingCategories.forEach(category => {
              addStudyCategory(category);
            });
          }
          
          const existingRecords = loadStudyRecords();
          const existingIds = new Set(existingRecords.map(r => r.id));
          
          let imported = 0;
          let skipped = 0;
          
          importData.records.forEach((record) => {
            // 检查是否已存在
            if (existingIds.has(record.id)) {
              skipped++;
              return;
            }
            
            // 添加记录
            try {
              addStudyRecord({
                date: record.date,
                category: record.category,
                videoTitle: record.videoTitle,
                episodeStart: record.episodeStart,
                episodeEnd: record.episodeEnd,
                totalTime: record.totalTime,
                remark: record.remark
              });
              imported++;
            } catch (error) {
              console.error('导入记录失败:', record, error);
              skipped++;
            }
          });
          
          resolve({
            imported,
            skipped,
            total: importData.records.length
          });
          
          console.log(`导入完成: ${imported} 条新记录 (${skipped} 条跳过)`);
        } catch (error) {
          console.error('导入学习记录失败:', error);
          reject(error instanceof Error ? error : new Error('导入学习记录失败，请重试'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('导入学习记录失败:', error);
      reject(new Error('导入学习记录失败，请重试'));
    }
  });
};
