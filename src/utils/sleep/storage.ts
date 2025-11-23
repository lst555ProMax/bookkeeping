import { SleepRecord } from './types';

const STORAGE_KEY = 'sleep_records';

// ==================== 基础存储操作 ====================

/**
 * 加载所有睡眠记录
 */
export const loadSleepRecords = (): SleepRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const records = JSON.parse(data) as SleepRecord[];
    return records.map((record) => ({
      ...record,
      createdAt: new Date(record.createdAt)
    }));
  } catch (error) {
    console.error('加载睡眠记录失败:', error);
    return [];
  }
};

/**
 * 保存睡眠记录到localStorage
 */
const saveSleepRecords = (records: SleepRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('保存睡眠记录失败:', error);
  }
};

/**
 * 添加新的睡眠记录
 */
export const addSleepRecord = (record: SleepRecord): void => {
  const records = loadSleepRecords();
  records.push(record);
  saveSleepRecords(records);
};

/**
 * 删除睡眠记录
 */
export const deleteSleepRecord = (id: string): void => {
  const records = loadSleepRecords();
  const updatedRecords = records.filter(record => record.id !== id);
  saveSleepRecords(updatedRecords);
};

/**
 * 更新睡眠记录
 */
export const updateSleepRecord = (updatedRecord: SleepRecord): void => {
  const records = loadSleepRecords();
  const index = records.findIndex(record => record.id === updatedRecord.id);
  
  if (index !== -1) {
    records[index] = updatedRecord;
    saveSleepRecords(records);
  }
};

/**
 * 根据ID获取睡眠记录
 */
export const getSleepRecordById = (id: string): SleepRecord | undefined => {
  const records = loadSleepRecords();
  return records.find(record => record.id === id);
};

/**
 * 清空所有睡眠记录（谨慎使用）
 */
export const clearAllSleepRecords = (): number => {
  const records = loadSleepRecords();
  const count = records.length;
  localStorage.removeItem(STORAGE_KEY);
  return count;
};

// ==================== 睡眠时长计算 ====================

/**
 * 计算睡眠时长（分钟）
 * @param sleepTime 入睡时间 HH:mm
 * @param wakeTime 醒来时间 HH:mm
 * @returns 睡眠时长（分钟）
 */
export const calculateSleepDuration = (sleepTime: string, wakeTime: string): number => {
  const [sleepHour, sleepMinute] = sleepTime.split(':').map(Number);
  const [wakeHour, wakeMinute] = wakeTime.split(':').map(Number);
  
  const sleepMinutes = sleepHour * 60 + sleepMinute;
  let wakeMinutes = wakeHour * 60 + wakeMinute;
  
  // 如果醒来时间小于入睡时间，说明跨越了午夜
  if (wakeMinutes < sleepMinutes) {
    wakeMinutes += 24 * 60;
  }
  
  return wakeMinutes - sleepMinutes;
};

/**
 * 格式化睡眠时长显示
 * @param minutes 分钟数
 * @returns 格式化的时长字符串 如: "7小时30分钟"
 */
export const formatSleepDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}分钟`;
  } else if (mins === 0) {
    return `${hours}小时`;
  } else {
    return `${hours}小时${mins}分钟`;
  }
};

/**
 * 将时间字符串转换为分钟数（从午夜开始计算）
 * @param time HH:mm格式
 * @returns 分钟数
 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * 将入睡时间转换为图表显示用的分钟数
 * 21:00-23:59 视为前一天晚上，转换为负值
 * @param time HH:mm格式
 * @returns 分钟数（21:00-23:59会返回负值）
 */
export const sleepTimeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  // 如果是21:00-23:59，视为前一天晚上
  if (hours >= 21) {
    return totalMinutes - 24 * 60; // 转换为负值
  }
  
  return totalMinutes;
};

/**
 * 将分钟数转换为时间字符串
 * @param minutes 分钟数
 * @returns HH:mm格式
 */
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

// ==================== 查询和统计 ====================

/**
 * 获取指定月份的睡眠记录
 * @param year 年份
 * @param month 月份（1-12）
 */
export const getSleepRecordsByMonth = (year: number, month: number): SleepRecord[] => {
  const records = loadSleepRecords();
  return records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getFullYear() === year && recordDate.getMonth() + 1 === month;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * 计算月度睡眠统计数据
 * @param year 年份
 * @param month 月份（1-12）
 */
export const getMonthSleepStats = (year: number, month: number) => {
  const records = getSleepRecordsByMonth(year, month);
  
  if (records.length === 0) {
    return {
      totalRecords: 0,
      averageSleepTime: '00:00',
      averageWakeTime: '00:00',
      averageDuration: 0,
      averageQuality: 0,
      lateNightDays: 0,
      insomniaDays: 0,
      sleepTimeRegularity: 0,
      durationRegularity: 0
    };
  }

  // 计算入睡时间平均值（分钟）- 使用sleepTimeToMinutes处理21:00-23:59的情况
  const sleepTimeMinutes = records.map(r => sleepTimeToMinutes(r.sleepTime));
  const avgSleepTime = sleepTimeMinutes.reduce((a, b) => a + b, 0) / sleepTimeMinutes.length;

  // 计算醒来时间平均值（分钟）
  const wakeTimeMinutes = records.map(r => timeToMinutes(r.wakeTime));
  const avgWakeTime = wakeTimeMinutes.reduce((a, b) => a + b, 0) / wakeTimeMinutes.length;

  // 计算睡眠时长平均值
  const durations = records.map(r => r.duration || 0);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

  // 计算睡眠质量平均值
  const qualities = records.map(r => r.quality);
  const avgQuality = qualities.reduce((a, b) => a + b, 0) / qualities.length;

  // 将平均入睡时间转换回正常时间格式
  let displayAvgSleepTime = avgSleepTime;
  if (displayAvgSleepTime < 0) {
    displayAvgSleepTime += 24 * 60; // 转换回21:00-23:59的范围
  }

  // 计算熬穿天数：入睡时间在6点-12点（早上6点到中午12点）
  const lateNightDays = records.filter(record => {
    const [hours] = record.sleepTime.split(':').map(Number);
    // 6点-12点视为熬夜（通宵到早上）
    return hours >= 6 && hours < 12;
  }).length;

  // 计算失眠天数：入睡时间在3点-6点（凌晨3点到早上6点）
  const insomniaDays = records.filter(record => {
    const [hours] = record.sleepTime.split(':').map(Number);
    // 3点-6点视为失眠（很晚才睡）
    return hours >= 3 && hours < 6;
  }).length;

  // 计算入睡规律性：入睡时间在平均入睡时间上下0.5小时区间的记录数 / 总记录数
  const sleepTimeRegularity = (() => {
    if (records.length === 0) return 0;
    const mean = avgSleepTime;
    const halfHourInMinutes = 30; // 0.5小时 = 30分钟
    
    // 处理跨天的情况：如果平均入睡时间是负数（21:00-23:59），需要特殊处理
    let meanForComparison = mean;
    if (mean < 0) {
      meanForComparison = mean + 24 * 60; // 转换为正数
    }
    
    const regularCount = records.filter(record => {
      const recordSleepTime = sleepTimeToMinutes(record.sleepTime);
      let recordTimeForComparison = recordSleepTime;
      if (recordSleepTime < 0) {
        recordTimeForComparison = recordSleepTime + 24 * 60;
      }
      
      // 计算时间差（考虑跨天情况）
      let diff = Math.abs(recordTimeForComparison - meanForComparison);
      if (diff > 12 * 60) { // 如果差值大于12小时，可能是跨天的情况
        diff = 24 * 60 - diff;
      }
      
      return diff <= halfHourInMinutes;
    }).length;
    
    return Math.round((regularCount / records.length) * 100);
  })();

  // 计算睡眠时长规律性：睡眠时长在平均睡眠时长上下0.5小时区间的记录数 / 总记录数
  const durationRegularity = (() => {
    if (records.length === 0) return 0;
    const mean = avgDuration;
    const halfHourInMinutes = 30; // 0.5小时 = 30分钟
    
    const regularCount = records.filter(record => {
      const duration = record.duration || 0;
      return Math.abs(duration - mean) <= halfHourInMinutes;
    }).length;
    
    return Math.round((regularCount / records.length) * 100);
  })();

  return {
    totalRecords: records.length,
    averageSleepTime: minutesToTime(displayAvgSleepTime),
    averageWakeTime: minutesToTime(avgWakeTime),
    averageDuration: Math.round(avgDuration),
    averageQuality: Math.round(avgQuality),
    lateNightDays,
    insomniaDays,
    sleepTimeRegularity,
    durationRegularity
  };
};

/**
 * 获取月度睡眠趋势数据（用于图表）
 * @param year 年份
 * @param month 月份（1-12）
 */
export const getMonthSleepTrend = (year: number, month: number) => {
  const records = getSleepRecordsByMonth(year, month);
  
  // 按日期正序排列
  const sortedRecords = records.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return sortedRecords.map(record => ({
    date: record.date,
    day: new Date(record.date).getDate(),
    sleepTime: sleepTimeToMinutes(record.sleepTime), // 使用新函数处理21:00-23:59
    wakeTime: timeToMinutes(record.wakeTime),
    duration: record.duration || 0,
    quality: record.quality
  }));
};
