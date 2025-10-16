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