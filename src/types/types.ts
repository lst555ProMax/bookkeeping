// 记录类型枚举
export enum RecordType {
  EXPENSE = 'expense',
  INCOME = 'income'
}

// 支出类别类型
export type ExpenseCategory = string;

// 收入类别类型
export type IncomeCategory = string;

// 默认支出类别
export const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  '餐饮',
  '零食',
  '出行',
  '旅游',
  '软件订阅',
  '医疗',
  '住房',
  '人情往来',
  '其他'
];

// 默认收入类别
export const DEFAULT_INCOME_CATEGORIES: IncomeCategory[] = [
  '工资收入',
  '奖助学金',
  '交易退款',
  '他人转账',
  '其他'
];

// 支出记录接口
export interface ExpenseRecord {
  id: string;
  date: string; // YYYY-MM-DD格式
  amount: number;
  category: ExpenseCategory;
  description?: string;
  createdAt: Date;
}

// 收入记录接口
export interface IncomeRecord {
  id: string;
  date: string; // YYYY-MM-DD格式
  amount: number;
  category: IncomeCategory;
  description?: string;
  createdAt: Date;
}

// 每日支出统计接口
export interface DailyExpense {
  date: string;
  records: ExpenseRecord[];
  total: number;
}

// 每日收入统计接口
export interface DailyIncome {
  date: string;
  records: IncomeRecord[];
  total: number;
}

// 睡眠质量等级枚举
export enum SleepQualityLevel {
  EXCELLENT = 'excellent',  // 优秀 (90-100)
  GOOD = 'good',           // 良好 (75-89)
  FAIR = 'fair',           // 一般 (60-74)
  POOR = 'poor'            // 较差 (<60)
}

// 睡眠质量等级中文映射
export const SLEEP_QUALITY_LABELS: Record<SleepQualityLevel, string> = {
  [SleepQualityLevel.EXCELLENT]: '优秀',
  [SleepQualityLevel.GOOD]: '良好',
  [SleepQualityLevel.FAIR]: '一般',
  [SleepQualityLevel.POOR]: '较差'
};

/**
 * 根据分数获取睡眠质量等级
 * @param score 睡眠质量分数 (0-100)
 * @returns 睡眠质量等级
 */
export const getSleepQualityLevel = (score: number): SleepQualityLevel => {
  if (score >= 90) return SleepQualityLevel.EXCELLENT;
  if (score >= 75) return SleepQualityLevel.GOOD;
  if (score >= 60) return SleepQualityLevel.FAIR;
  return SleepQualityLevel.POOR;
};

// 睡眠记录接口
export interface SleepRecord {
  id: string;
  date: string; // YYYY-MM-DD格式
  sleepTime: string; // HH:mm格式 - 入睡时间
  wakeTime: string; // HH:mm格式 - 醒来时间
  quality: number; // 睡眠质量分数 (0-100)
  duration?: number; // 睡眠时长（分钟），可选，可以自动计算
  notes?: string; // 备注
  createdAt: Date;
}

// 业务模式枚举
export enum BusinessMode {
  ACCOUNTING = 'accounting',  // 记账
  SLEEP = 'sleep'            // 睡眠记录
}

// 业务模式中文映射
export const BUSINESS_MODE_LABELS: Record<BusinessMode, string> = {
  [BusinessMode.ACCOUNTING]: '账单记录',
  [BusinessMode.SLEEP]: '睡眠记录'
};