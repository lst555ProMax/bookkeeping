import { ExpenseRecord, IncomeRecord } from '@/types';

// ==================== 存储键 ====================
const EXPENSE_STORAGE_KEY = 'bookkeeping_expenses';
const INCOME_STORAGE_KEY = 'bookkeeping_incomes';

// ==================== 支出记录管理 ====================

export const saveExpenses = (expenses: ExpenseRecord[]): void => {
  localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(expenses));
};

export const loadExpenses = (): ExpenseRecord[] => {
  const data = localStorage.getItem(EXPENSE_STORAGE_KEY);
  if (!data) return [];
  
  try {
    const expenses = JSON.parse(data) as ExpenseRecord[];
    // 确保日期格式正确
    return expenses.map((expense) => ({
      ...expense,
      createdAt: new Date(expense.createdAt)
    }));
  } catch {
    return [];
  }
};

export const addExpense = (expense: ExpenseRecord): void => {
  const expenses = loadExpenses();
  expenses.push(expense);
  saveExpenses(expenses);
};

export const deleteExpense = (id: string): void => {
  const expenses = loadExpenses();
  const filteredExpenses = expenses.filter(expense => expense.id !== id);
  saveExpenses(filteredExpenses);
};

export const updateExpense = (updatedExpense: ExpenseRecord): void => {
  const expenses = loadExpenses();
  const updatedExpenses = expenses.map(expense => 
    expense.id === updatedExpense.id ? updatedExpense : expense
  );
  saveExpenses(updatedExpenses);
};

// ==================== 收入记录管理 ====================

export const saveIncomes = (incomes: IncomeRecord[]): void => {
  localStorage.setItem(INCOME_STORAGE_KEY, JSON.stringify(incomes));
};

export const loadIncomes = (): IncomeRecord[] => {
  const data = localStorage.getItem(INCOME_STORAGE_KEY);
  if (!data) return [];
  
  try {
    const incomes = JSON.parse(data) as IncomeRecord[];
    // 确保日期格式正确
    return incomes.map((income) => ({
      ...income,
      createdAt: new Date(income.createdAt)
    }));
  } catch {
    return [];
  }
};

export const addIncome = (income: IncomeRecord): void => {
  const incomes = loadIncomes();
  incomes.push(income);
  saveIncomes(incomes);
};

export const deleteIncome = (id: string): void => {
  const incomes = loadIncomes();
  const filteredIncomes = incomes.filter(income => income.id !== id);
  saveIncomes(filteredIncomes);
};

export const updateIncome = (updatedIncome: IncomeRecord): void => {
  const incomes = loadIncomes();
  const updatedIncomes = incomes.map(income => 
    income.id === updatedIncome.id ? updatedIncome : income
  );
  saveIncomes(updatedIncomes);
};

// ==================== 清空数据 ====================

/**
 * 清空所有记账数据（谨慎使用）
 */
export const clearAllAccountingData = (): { expenses: number; incomes: number } => {
  const expenses = loadExpenses();
  const incomes = loadIncomes();
  const expenseCount = expenses.length;
  const incomeCount = incomes.length;
  
  localStorage.removeItem(EXPENSE_STORAGE_KEY);
  localStorage.removeItem(INCOME_STORAGE_KEY);
  
  return { expenses: expenseCount, incomes: incomeCount };
};

/**
 * 只清空支出数据
 */
export const clearExpensesOnly = (): number => {
  const expenses = loadExpenses();
  const count = expenses.length;
  
  localStorage.removeItem(EXPENSE_STORAGE_KEY);
  
  return count;
};

/**
 * 只清空收入数据
 */
export const clearIncomesOnly = (): number => {
  const incomes = loadIncomes();
  const count = incomes.length;
  
  localStorage.removeItem(INCOME_STORAGE_KEY);
  
  return count;
};
