import { ExpenseCategory, IncomeCategory, DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@/types';
import { loadExpenses, saveExpenses, loadIncomes, saveIncomes } from './storage';

// ==================== 存储键 ====================
const EXPENSE_CATEGORIES_STORAGE_KEY = 'bookkeeping_categories';
const INCOME_CATEGORIES_STORAGE_KEY = 'bookkeeping_income_categories';

// ==================== 支出分类管理 ====================

/**
 * 获取所有支出分类（用于下拉选择，"其他"在最后）
 */
export const getCategories = (): ExpenseCategory[] => {
  const stored = localStorage.getItem(EXPENSE_CATEGORIES_STORAGE_KEY);
  let categories: ExpenseCategory[];
  
  if (!stored) {
    categories = DEFAULT_EXPENSE_CATEGORIES.slice();
  } else {
    try {
      categories = JSON.parse(stored) as ExpenseCategory[];
    } catch {
      categories = DEFAULT_EXPENSE_CATEGORIES.slice();
    }
  }
  
  // 确保"其他"分类始终存在且在最后
  const otherIndex = categories.indexOf('其他');
  if (otherIndex !== -1) {
    categories.splice(otherIndex, 1);
  }
  categories.push('其他');
  
  saveCategories(categories);
  return categories;
};

/**
 * 获取可管理的分类（排除"其他"）
 */
export const getManageableCategories = (): ExpenseCategory[] => {
  const allCategories = getCategories();
  return allCategories.filter(cat => cat !== '其他');
};

/**
 * 保存分类到localStorage
 */
export const saveCategories = (categories: ExpenseCategory[]): void => {
  localStorage.setItem(EXPENSE_CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
};

/**
 * 保存分类顺序
 */
export const saveCategoriesOrder = (categories: ExpenseCategory[]): void => {
  const otherIndex = categories.indexOf('其他');
  if (otherIndex !== -1) {
    categories.splice(otherIndex, 1);
  }
  categories.push('其他');
  
  saveCategories(categories);
};

/**
 * 添加新分类
 */
export const addCategory = (newCategory: string): boolean => {
  const trimmedCategory = newCategory.trim();
  if (!trimmedCategory) return false;
  
  const currentCategories = getCategories();
  
  if (currentCategories.includes(trimmedCategory)) {
    return false;
  }
  
  const otherIndex = currentCategories.indexOf('其他');
  if (otherIndex !== -1) {
    currentCategories.splice(otherIndex, 1);
  }
  
  currentCategories.push(trimmedCategory);
  currentCategories.push('其他');
  
  saveCategories(currentCategories);
  return true;
};

/**
 * 删除分类
 */
export const deleteCategory = (categoryToDelete: ExpenseCategory): boolean => {
  if (categoryToDelete === '其他') {
    return false;
  }
  
  const currentCategories = getCategories();
  const updatedCategories = currentCategories.filter(cat => cat !== categoryToDelete);
  
  // 将所有使用该分类的记录改为"其他"
  const expenses = loadExpenses();
  const updatedExpenses = expenses.map(expense => 
    expense.category === categoryToDelete 
      ? { ...expense, category: '其他' as ExpenseCategory }
      : expense
  );
  
  saveCategories(updatedCategories);
  saveExpenses(updatedExpenses);
  return true;
};

/**
 * 修改分类名称
 */
export const updateCategory = (oldCategory: ExpenseCategory, newCategory: string): boolean => {
  const trimmedNewCategory = newCategory.trim();
  if (!trimmedNewCategory || oldCategory === '其他') return false;
  
  const currentCategories = getCategories();
  
  if (trimmedNewCategory !== oldCategory && currentCategories.includes(trimmedNewCategory)) {
    return false;
  }
  
  const updatedCategories = currentCategories.map(cat => 
    cat === oldCategory ? trimmedNewCategory : cat
  );
  
  const otherIndex = updatedCategories.indexOf('其他');
  if (otherIndex !== -1 && otherIndex !== updatedCategories.length - 1) {
    updatedCategories.splice(otherIndex, 1);
    updatedCategories.push('其他');
  }
  
  const expenses = loadExpenses();
  const updatedExpenses = expenses.map(expense => 
    expense.category === oldCategory 
      ? { ...expense, category: trimmedNewCategory as ExpenseCategory }
      : expense
  );
  
  saveCategories(updatedCategories);
  saveExpenses(updatedExpenses);
  return true;
};

/**
 * 检查分类是否有相关记录
 */
export const categoryHasRecords = (category: ExpenseCategory): boolean => {
  const expenses = loadExpenses();
  return expenses.some(expense => expense.category === category);
};

// ==================== 收入分类管理 ====================

/**
 * 获取所有收入分类（用于下拉选择，"其他"在最后）
 */
export const getIncomeCategories = (): IncomeCategory[] => {
  const stored = localStorage.getItem(INCOME_CATEGORIES_STORAGE_KEY);
  let categories: IncomeCategory[];
  
  if (!stored) {
    categories = DEFAULT_INCOME_CATEGORIES.slice();
  } else {
    try {
      categories = JSON.parse(stored) as IncomeCategory[];
    } catch {
      categories = DEFAULT_INCOME_CATEGORIES.slice();
    }
  }
  
  const otherIndex = categories.indexOf('其他');
  if (otherIndex !== -1) {
    categories.splice(otherIndex, 1);
  }
  categories.push('其他');
  
  saveIncomeCategories(categories);
  return categories;
};

/**
 * 获取可管理的收入分类（排除"其他"）
 */
export const getManageableIncomeCategories = (): IncomeCategory[] => {
  const allCategories = getIncomeCategories();
  return allCategories.filter(cat => cat !== '其他');
};

/**
 * 保存收入分类到localStorage
 */
export const saveIncomeCategories = (categories: IncomeCategory[]): void => {
  localStorage.setItem(INCOME_CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
};

/**
 * 保存收入分类顺序
 */
export const saveIncomeCategoriesOrder = (categories: IncomeCategory[]): void => {
  const otherIndex = categories.indexOf('其他');
  if (otherIndex !== -1) {
    categories.splice(otherIndex, 1);
  }
  categories.push('其他');
  
  saveIncomeCategories(categories);
};

/**
 * 添加新收入分类
 */
export const addIncomeCategory = (newCategory: string): boolean => {
  const trimmedCategory = newCategory.trim();
  if (!trimmedCategory) return false;
  
  const currentCategories = getIncomeCategories();
  
  if (currentCategories.includes(trimmedCategory)) {
    return false;
  }
  
  const otherIndex = currentCategories.indexOf('其他');
  if (otherIndex !== -1) {
    currentCategories.splice(otherIndex, 1);
  }
  
  currentCategories.push(trimmedCategory);
  currentCategories.push('其他');
  
  saveIncomeCategories(currentCategories);
  return true;
};

/**
 * 删除收入分类
 */
export const deleteIncomeCategory = (categoryToDelete: IncomeCategory): boolean => {
  if (categoryToDelete === '其他') {
    return false;
  }
  
  const currentCategories = getIncomeCategories();
  const updatedCategories = currentCategories.filter(cat => cat !== categoryToDelete);
  
  const incomes = loadIncomes();
  const updatedIncomes = incomes.map(income => 
    income.category === categoryToDelete 
      ? { ...income, category: '其他' as IncomeCategory }
      : income
  );
  
  saveIncomeCategories(updatedCategories);
  saveIncomes(updatedIncomes);
  return true;
};

/**
 * 修改收入分类名称
 */
export const updateIncomeCategory = (oldCategory: IncomeCategory, newCategory: string): boolean => {
  const trimmedNewCategory = newCategory.trim();
  if (!trimmedNewCategory || oldCategory === '其他') return false;
  
  const currentCategories = getIncomeCategories();
  
  if (trimmedNewCategory !== oldCategory && currentCategories.includes(trimmedNewCategory)) {
    return false;
  }
  
  const updatedCategories = currentCategories.map(cat => 
    cat === oldCategory ? trimmedNewCategory : cat
  );
  
  const otherIndex = updatedCategories.indexOf('其他');
  if (otherIndex !== -1 && otherIndex !== updatedCategories.length - 1) {
    updatedCategories.splice(otherIndex, 1);
    updatedCategories.push('其他');
  }
  
  const incomes = loadIncomes();
  const updatedIncomes = incomes.map(income => 
    income.category === oldCategory 
      ? { ...income, category: trimmedNewCategory as IncomeCategory }
      : income
  );
  
  saveIncomeCategories(updatedCategories);
  saveIncomes(updatedIncomes);
  return true;
};

/**
 * 检查收入分类是否有相关记录
 */
export const incomeCategoryHasRecords = (category: IncomeCategory): boolean => {
  const incomes = loadIncomes();
  return incomes.some(income => income.category === category);
};
