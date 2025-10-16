import { IncomeRecord } from '@/types';

const INCOME_STORAGE_KEY = 'bookkeeping_incomes';

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