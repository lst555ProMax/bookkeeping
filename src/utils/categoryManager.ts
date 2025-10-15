import { ExpenseCategory, DEFAULT_CATEGORIES } from '@/types';
import { loadExpenses, saveExpenses } from './storage';

const CATEGORIES_STORAGE_KEY = 'bookkeeping_categories';

// 获取所有分类（用于下拉选择，"其他"在最后）
export const getCategories = (): ExpenseCategory[] => {
  const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
  let categories: ExpenseCategory[];
  
  if (!stored) {
    // 如果没有存储的分类，使用默认分类并保存
    categories = DEFAULT_CATEGORIES.slice();
  } else {
    try {
      categories = JSON.parse(stored) as ExpenseCategory[];
    } catch {
      // 解析失败时使用默认分类
      categories = DEFAULT_CATEGORIES.slice();
    }
  }
  
  // 确保"其他"分类始终存在且在最后
  const otherIndex = categories.indexOf('其他');
  if (otherIndex !== -1) {
    categories.splice(otherIndex, 1); // 移除原来的"其他"
  }
  categories.push('其他'); // 添加到末尾
  
  saveCategories(categories);
  return categories;
};

// 获取可管理的分类（排除"其他"）
export const getManageableCategories = (): ExpenseCategory[] => {
  const allCategories = getCategories();
  return allCategories.filter(cat => cat !== '其他');
};

// 保存分类顺序
export const saveCategoriesOrder = (categories: ExpenseCategory[]): void => {
  // 确保"其他"在最后
  const otherIndex = categories.indexOf('其他');
  if (otherIndex !== -1) {
    categories.splice(otherIndex, 1);
  }
  categories.push('其他');
  
  saveCategories(categories);
};

// 保存分类到localStorage
export const saveCategories = (categories: ExpenseCategory[]): void => {
  localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
};

// 添加新分类
export const addCategory = (newCategory: string): boolean => {
  const trimmedCategory = newCategory.trim();
  if (!trimmedCategory) return false;
  
  const currentCategories = getCategories();
  
  // 检查是否已存在
  if (currentCategories.includes(trimmedCategory)) {
    return false;
  }
  
  // 移除"其他"，添加新分类，再加回"其他"
  const otherIndex = currentCategories.indexOf('其他');
  if (otherIndex !== -1) {
    currentCategories.splice(otherIndex, 1);
  }
  
  currentCategories.push(trimmedCategory);
  currentCategories.push('其他');
  
  saveCategories(currentCategories);
  return true;
};

// 删除分类
export const deleteCategory = (categoryToDelete: ExpenseCategory): boolean => {
  // 不能删除"其他"分类
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

// 修改分类名称
export const updateCategory = (oldCategory: ExpenseCategory, newCategory: string): boolean => {
  const trimmedNewCategory = newCategory.trim();
  if (!trimmedNewCategory) return false;
  
  // 不能修改"其他"分类
  if (oldCategory === '其他') {
    return false;
  }
  
  const currentCategories = getCategories();
  
  // 检查新名称是否已存在（除了当前分类）
  if (trimmedNewCategory !== oldCategory && currentCategories.includes(trimmedNewCategory)) {
    return false;
  }
  
  // 更新分类列表，确保"其他"在最后
  const updatedCategories = currentCategories.map(cat => 
    cat === oldCategory ? trimmedNewCategory : cat
  );
  
  // 再次确保"其他"在最后
  const otherIndex = updatedCategories.indexOf('其他');
  if (otherIndex !== -1 && otherIndex !== updatedCategories.length - 1) {
    updatedCategories.splice(otherIndex, 1);
    updatedCategories.push('其他');
  }
  
  // 更新所有使用该分类的记录
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

// 检查分类是否有相关记录
export const categoryHasRecords = (category: ExpenseCategory): boolean => {
  const expenses = loadExpenses();
  return expenses.some(expense => expense.category === category);
};