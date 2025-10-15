// 支出类别类型
export type ExpenseCategory = string;

// 默认支出类别
export const DEFAULT_CATEGORIES: ExpenseCategory[] = [
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

// 支出记录接口
export interface ExpenseRecord {
  id: string;
  date: string; // YYYY-MM-DD格式
  amount: number;
  category: ExpenseCategory;
  description?: string;
  createdAt: Date;
}

// 每日支出统计接口
export interface DailyExpense {
  date: string;
  records: ExpenseRecord[];
  total: number;
}