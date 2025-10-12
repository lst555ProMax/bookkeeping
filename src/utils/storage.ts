import { ExpenseRecord } from '@/types';

const STORAGE_KEY = 'bookkeeping_expenses';

export const saveExpenses = (expenses: ExpenseRecord[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
};

export const loadExpenses = (): ExpenseRecord[] => {
  const data = localStorage.getItem(STORAGE_KEY);
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