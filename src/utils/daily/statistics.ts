import { DailyRecord, MealStatus } from '@/types';
import { loadDailyRecords, getDailyRecordsByMonth } from './storage';

/**
 * 月度统计数据接口
 */
export interface MonthlyStats {
  totalRecords: number;
  regularMealsRate: number; // 规律饮食比例
  mealStats: {
    breakfast: { regular: number; irregular: number; notEaten: number };
    lunch: { regular: number; irregular: number; notEaten: number };
    dinner: { regular: number; irregular: number; notEaten: number };
  };
  hygieneRate: number; // 洗漱完成率
  bathingRate: number; // 洗浴完成率
  averageSteps: number; // 平均步数
  totalLaundry: number; // 洗衣次数
  totalCleaning: number; // 打扫次数
  workDays: number; // 工作天数
  averageWorkHours: number; // 平均工作时长（小时）
  averageCompanyHours: number; // 平均在公司时长（小时）
  checkInComplianceRate: number; // 签到合格率（不晚于9点）
  checkOutComplianceRate: number; // 签退合格率（不早于18点）
  leaveComplianceRate: number; // 离开合格率（不早于22点）
  dailyHygieneCompletionRate: number; // 每日内务完成率（早洗+晚洗+洗脸+洗脚）
  hairWashCompletionRate: number; // 洗头完成率（2天一次）
  showerCompletionRate: number; // 洗澡完成率（7天一次）
  laundryCompletionRate: number; // 洗衣完成率（3天一次）
  cleaningCompletionRate: number; // 打扫完成率（7天一次）
}

/**
 * 趋势数据接口
 */
export interface DailyTrendData {
  date: string;
  steps: number;
  mealRegularity: number; // 0-100 的规律性评分
  hygieneScore: number; // 0-100 的卫生评分
  workHours: number; // 工作时长（小时）
  companyHours: number; // 在公司时长（小时）
  checkInCompliant: boolean; // 签到是否合格
  checkOutCompliant: boolean; // 签退是否合格
  leaveCompliant: boolean; // 离开是否合格
}

/**
 * 计算三餐规律性评分（0-100）
 */
const calculateMealRegularity = (meals: DailyRecord['meals']): number => {
  let score = 0;
  const mealCount = 3;
  
  // 每餐的评分
  const mealValues = [meals.breakfast, meals.lunch, meals.dinner];
  mealValues.forEach(meal => {
    if (meal === MealStatus.EATEN_REGULAR) {
      score += 100 / mealCount;
    } else if (meal === MealStatus.EATEN_IRREGULAR) {
      score += 50 / mealCount;
    }
    // NOT_EATEN 不加分
  });
  
  return Math.round(score);
};

/**
 * 计算卫生习惯评分（0-100）
 */
const calculateHygieneScore = (record: DailyRecord): number => {
  let score = 0;
  const totalItems = 6; // 早洗漱、晚洗漱、洗澡、洗头、洗脚、洗脸
  
  if (record.hygiene.morningWash) score += 100 / totalItems;
  if (record.hygiene.nightWash) score += 100 / totalItems;
  if (record.bathing.shower) score += 100 / totalItems;
  if (record.bathing.hairWash) score += 100 / totalItems;
  if (record.bathing.footWash) score += 100 / totalItems;
  if (record.bathing.faceWash) score += 100 / totalItems;
  
  return Math.round(score);
};

/**
 * 计算工作时长（小时）
 */
const calculateWorkHours = (record: DailyRecord): number => {
  if (!record.checkInTime || !record.checkOutTime) return 0;
  
  const [inHour, inMin] = record.checkInTime.split(':').map(Number);
  const [outHour, outMin] = record.checkOutTime.split(':').map(Number);
  
  const inMinutes = inHour * 60 + inMin;
  const outMinutes = outHour * 60 + outMin;
  
  return Math.round(((outMinutes - inMinutes) / 60) * 10) / 10;
};

/**
 * 计算在公司时长（小时）- 从签到到离开
 */
const calculateCompanyHours = (record: DailyRecord): number => {
  if (!record.checkInTime || !record.leaveTime) return 0;
  
  const [inHour, inMin] = record.checkInTime.split(':').map(Number);
  const [leaveHour, leaveMin] = record.leaveTime.split(':').map(Number);
  
  const inMinutes = inHour * 60 + inMin;
  const leaveMinutes = leaveHour * 60 + leaveMin;
  
  return Math.round(((leaveMinutes - inMinutes) / 60) * 10) / 10;
};

/**
 * 检查签到是否合格（不晚于9:00）
 */
const isCheckInCompliant = (record: DailyRecord): boolean => {
  if (!record.checkInTime) return false;
  const [hour, min] = record.checkInTime.split(':').map(Number);
  return hour < 9 || (hour === 9 && min === 0);
};

/**
 * 检查签退是否合格（不早于18:00）
 */
const isCheckOutCompliant = (record: DailyRecord): boolean => {
  if (!record.checkOutTime) return false;
  const [hour] = record.checkOutTime.split(':').map(Number);
  return hour >= 18;
};

/**
 * 检查离开是否合格（不早于22:00）
 */
const isLeaveCompliant = (record: DailyRecord): boolean => {
  if (!record.leaveTime) return false;
  const [hour] = record.leaveTime.split(':').map(Number);
  return hour >= 22;
};

/**
 * 检查每日内务是否完成（早洗+晚洗+洗脸+洗脚）
 */
const isDailyHygieneComplete = (record: DailyRecord): boolean => {
  return record.hygiene.morningWash && 
         record.hygiene.nightWash && 
         record.bathing.faceWash && 
         record.bathing.footWash;
};

/**
 * 获取指定月份的统计数据
 */
export const getMonthlyStats = (year: number, month: number): MonthlyStats => {
  const records = getDailyRecordsByMonth(year, month);
  
  if (records.length === 0) {
    return {
      totalRecords: 0,
      regularMealsRate: 0,
      mealStats: {
        breakfast: { regular: 0, irregular: 0, notEaten: 0 },
        lunch: { regular: 0, irregular: 0, notEaten: 0 },
        dinner: { regular: 0, irregular: 0, notEaten: 0 }
      },
      hygieneRate: 0,
      bathingRate: 0,
      averageSteps: 0,
      totalLaundry: 0,
      totalCleaning: 0,
      workDays: 0,
      averageWorkHours: 0,
      averageCompanyHours: 0,
      checkInComplianceRate: 0,
      checkOutComplianceRate: 0,
      leaveComplianceRate: 0,
      dailyHygieneCompletionRate: 0,
      hairWashCompletionRate: 0,
      showerCompletionRate: 0,
      laundryCompletionRate: 0,
      cleaningCompletionRate: 0
    };
  }
  
  // 初始化统计
  const mealStats = {
    breakfast: { regular: 0, irregular: 0, notEaten: 0 },
    lunch: { regular: 0, irregular: 0, notEaten: 0 },
    dinner: { regular: 0, irregular: 0, notEaten: 0 }
  };
  
  let totalHygieneComplete = 0;
  let totalBathingComplete = 0;
  let totalSteps = 0;
  let stepsCount = 0;
  let totalLaundry = 0;
  let totalCleaning = 0;
  let workDays = 0;
  let totalWorkHours = 0;
  let totalCompanyHours = 0;
  let regularMealsCount = 0;
  let checkInCompliantCount = 0;
  let checkOutCompliantCount = 0;
  let leaveCompliantCount = 0;
  let dailyHygieneCompleteCount = 0;
  let hairWashCount = 0;
  let showerCount = 0;
  let companyDaysCount = 0;
  
  records.forEach(record => {
    // 三餐统计
    const meals = ['breakfast', 'lunch', 'dinner'] as const;
    meals.forEach(meal => {
      const status = record.meals[meal];
      if (status === MealStatus.EATEN_REGULAR) {
        mealStats[meal].regular++;
        regularMealsCount++;
      } else if (status === MealStatus.EATEN_IRREGULAR) {
        mealStats[meal].irregular++;
      } else {
        mealStats[meal].notEaten++;
      }
    });
    
    // 洗漱完成统计（早晚都洗算完成）
    if (record.hygiene.morningWash && record.hygiene.nightWash) {
      totalHygieneComplete++;
    }
    
    // 洗浴完成统计（洗澡且洗脚算完成）
    if (record.bathing.shower && record.bathing.footWash) {
      totalBathingComplete++;
    }
    
    // 步数统计
    if (record.wechatSteps && record.wechatSteps > 0) {
      totalSteps += record.wechatSteps;
      stepsCount++;
    }
    
    // 洗衣和打扫
    if (record.laundry) totalLaundry++;
    if (record.cleaning) totalCleaning++;
    
    // 工作时长和在公司时长
    if (record.checkInTime && record.checkOutTime) {
      workDays++;
      totalWorkHours += calculateWorkHours(record);
    }
    if (record.checkInTime && record.leaveTime) {
      companyDaysCount++;
      totalCompanyHours += calculateCompanyHours(record);
    }
    
    // 考勤合规统计
    if (isCheckInCompliant(record)) checkInCompliantCount++;
    if (isCheckOutCompliant(record)) checkOutCompliantCount++;
    if (isLeaveCompliant(record)) leaveCompliantCount++;
    
    // 内务完成统计
    if (isDailyHygieneComplete(record)) dailyHygieneCompleteCount++;
    if (record.bathing.hairWash) hairWashCount++;
    if (record.bathing.shower) showerCount++;
  });
  
  // 计算期望完成次数
  const expectedHairWash = Math.ceil(records.length / 2); // 2天一次
  const expectedShower = Math.ceil(records.length / 7); // 7天一次
  const expectedLaundry = Math.ceil(records.length / 3); // 3天一次
  const expectedCleaning = Math.ceil(records.length / 7); // 7天一次
  
  return {
    totalRecords: records.length,
    regularMealsRate: Math.round((regularMealsCount / (records.length * 3)) * 100),
    mealStats,
    hygieneRate: Math.round((totalHygieneComplete / records.length) * 100),
    bathingRate: Math.round((totalBathingComplete / records.length) * 100),
    averageSteps: stepsCount > 0 ? Math.round(totalSteps / stepsCount) : 0,
    totalLaundry,
    totalCleaning,
    workDays,
    averageWorkHours: workDays > 0 ? Math.round((totalWorkHours / workDays) * 10) / 10 : 0,
    averageCompanyHours: companyDaysCount > 0 ? Math.round((totalCompanyHours / companyDaysCount) * 10) / 10 : 0,
    checkInComplianceRate: workDays > 0 ? Math.round((checkInCompliantCount / workDays) * 100) : 0,
    checkOutComplianceRate: workDays > 0 ? Math.round((checkOutCompliantCount / workDays) * 100) : 0,
    leaveComplianceRate: companyDaysCount > 0 ? Math.round((leaveCompliantCount / companyDaysCount) * 100) : 0,
    dailyHygieneCompletionRate: Math.round((dailyHygieneCompleteCount / records.length) * 100),
    hairWashCompletionRate: expectedHairWash > 0 ? Math.round((hairWashCount / expectedHairWash) * 100) : 0,
    showerCompletionRate: expectedShower > 0 ? Math.round((showerCount / expectedShower) * 100) : 0,
    laundryCompletionRate: expectedLaundry > 0 ? Math.round((totalLaundry / expectedLaundry) * 100) : 0,
    cleaningCompletionRate: expectedCleaning > 0 ? Math.round((totalCleaning / expectedCleaning) * 100) : 0
  };
};

/**
 * 获取指定月份的趋势数据
 */
export const getMonthlyTrendData = (year: number, month: number): DailyTrendData[] => {
  const records = getDailyRecordsByMonth(year, month);
  
  return records.map(record => ({
    date: record.date,
    steps: record.wechatSteps || 0,
    mealRegularity: calculateMealRegularity(record.meals),
    hygieneScore: calculateHygieneScore(record),
    workHours: calculateWorkHours(record),
    companyHours: calculateCompanyHours(record),
    checkInCompliant: isCheckInCompliant(record),
    checkOutCompliant: isCheckOutCompliant(record),
    leaveCompliant: isLeaveCompliant(record)
  })).reverse(); // 按日期正序排列
};

/**
 * 获取最近N天的趋势数据
 */
export const getRecentTrendData = (days: number = 7): DailyTrendData[] => {
  const records = loadDailyRecords();
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);
  
  const recentRecords = records
    .filter(record => new Date(record.date) >= startDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return recentRecords.map(record => ({
    date: record.date,
    steps: record.wechatSteps || 0,
    mealRegularity: calculateMealRegularity(record.meals),
    hygieneScore: calculateHygieneScore(record),
    workHours: calculateWorkHours(record),
    companyHours: calculateCompanyHours(record),
    checkInCompliant: isCheckInCompliant(record),
    checkOutCompliant: isCheckOutCompliant(record),
    leaveCompliant: isLeaveCompliant(record)
  }));
};

/**
 * 获取生活习惯统计（用于饼图）
 */
export interface HabitStats {
  name: string;
  value: number;
  percentage: number;
  [key: string]: string | number;
}

export const getHabitStats = (year: number, month: number): HabitStats[] => {
  const records = getDailyRecordsByMonth(year, month);
  const total = records.length;
  
  if (total === 0) return [];
  
  const stats = {
    morningWash: records.filter(r => r.hygiene.morningWash).length,
    nightWash: records.filter(r => r.hygiene.nightWash).length,
    shower: records.filter(r => r.bathing.shower).length,
    hairWash: records.filter(r => r.bathing.hairWash).length,
    footWash: records.filter(r => r.bathing.footWash).length,
    laundry: records.filter(r => r.laundry).length,
    cleaning: records.filter(r => r.cleaning).length
  };
  
  return [
    { name: '早上洗漱', value: stats.morningWash, percentage: Math.round((stats.morningWash / total) * 100) },
    { name: '晚上洗漱', value: stats.nightWash, percentage: Math.round((stats.nightWash / total) * 100) },
    { name: '洗澡', value: stats.shower, percentage: Math.round((stats.shower / total) * 100) },
    { name: '洗头', value: stats.hairWash, percentage: Math.round((stats.hairWash / total) * 100) },
    { name: '洗脚', value: stats.footWash, percentage: Math.round((stats.footWash / total) * 100) },
    { name: '洗衣服', value: stats.laundry, percentage: Math.round((stats.laundry / total) * 100) },
    { name: '打扫卫生', value: stats.cleaning, percentage: Math.round((stats.cleaning / total) * 100) }
  ];
};
