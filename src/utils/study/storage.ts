// 学习记录存储管理
import { StudyRecord, StudyRecordFormData } from '@/types';
import { generateId } from '../helpers';

const STORAGE_KEY = 'study_records';

/**
 * 从 localStorage 加载学习记录
 */
export const loadStudyRecords = (): StudyRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const records = JSON.parse(data);
      // 按日期降序排序（最新的在前）
      return records.sort((a: StudyRecord, b: StudyRecord) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
  } catch (error) {
    console.error('加载学习记录失败:', error);
  }
  return [];
};

/**
 * 保存学习记录到 localStorage
 */
const saveStudyRecords = (records: StudyRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('保存学习记录失败:', error);
  }
};

/**
 * 添加学习记录
 */
export const addStudyRecord = (formData: StudyRecordFormData): StudyRecord => {
  const records = loadStudyRecords();
  const now = new Date().toISOString();
  
  const newRecord: StudyRecord = {
    id: generateId(),
    ...formData,
    createdAt: now,
    updatedAt: now
  };
  
  records.push(newRecord);
  saveStudyRecords(records);
  
  return newRecord;
};

/**
 * 删除学习记录
 */
export const deleteStudyRecord = (id: string): void => {
  const records = loadStudyRecords();
  const filtered = records.filter(record => record.id !== id);
  saveStudyRecords(filtered);
};

/**
 * 更新学习记录
 */
export const updateStudyRecord = (updatedRecord: StudyRecord): void => {
  const records = loadStudyRecords();
  const index = records.findIndex(record => record.id === updatedRecord.id);
  
  if (index !== -1) {
    records[index] = {
      ...updatedRecord,
      updatedAt: new Date().toISOString()
    };
    saveStudyRecords(records);
  }
};

/**
 * 根据ID获取学习记录
 */
export const getStudyRecordById = (id: string): StudyRecord | undefined => {
  const records = loadStudyRecords();
  return records.find(record => record.id === id);
};

/**
 * 清空所有学习记录
 */
export const clearAllStudyRecords = (): number => {
  const records = loadStudyRecords();
  const count = records.length;
  localStorage.removeItem(STORAGE_KEY);
  return count;
};

/**
 * 获取学习记录统计信息
 */
export const getStudyRecordsStats = () => {
  const records = loadStudyRecords();
  
  // 计算总观看时间
  const totalTime = records.reduce((sum, record) => sum + record.totalTime, 0);
  
  // 计算总观看集数
  const totalEpisodes = records.reduce((sum, record) => 
    sum + (record.episodeEnd - record.episodeStart + 1), 0
  );
  
  // 按视频标题分组统计
  const videoStats = records.reduce((acc, record) => {
    if (!acc[record.videoTitle]) {
      acc[record.videoTitle] = {
        totalTime: 0,
        totalEpisodes: 0,
        recordCount: 0
      };
    }
    
    acc[record.videoTitle].totalTime += record.totalTime;
    acc[record.videoTitle].totalEpisodes += (record.episodeEnd - record.episodeStart + 1);
    acc[record.videoTitle].recordCount += 1;
    
    return acc;
  }, {} as Record<string, { totalTime: number; totalEpisodes: number; recordCount: number }>);
  
  return {
    totalRecords: records.length,
    totalTime,
    totalEpisodes,
    videoStats
  };
};
