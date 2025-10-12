// 支出类别枚举
export enum ExpenseCategory {
  MEALS = '餐饮',
  SNACKS = '零食',
  TRANSPORT = '出行',
  TRAVEL = '旅游',
  SOFTWARE = '软件订阅',
  MEDICAL = '医疗',
  HOUSING = '住房',
  GIFTS = '人情往来',
  OTHER = '其他'
}

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