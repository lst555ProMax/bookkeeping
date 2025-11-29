import { StudyCategory, DEFAULT_STUDY_CATEGORIES } from './types';
import { loadStudyRecords, saveStudyRecords } from './storage';

// ==================== 存储键 ====================
const STUDY_CATEGORIES_STORAGE_KEY = 'bookkeeping_study_categories';

// ==================== 学习分类管理 ====================

/**
 * 获取所有学习分类（用于下拉选择，"其它"在最后）
 */
export const getStudyCategories = (): StudyCategory[] => {
  const stored = localStorage.getItem(STUDY_CATEGORIES_STORAGE_KEY);
  let categories: StudyCategory[];
  
  if (!stored) {
    categories = DEFAULT_STUDY_CATEGORIES.slice();
  } else {
    try {
      categories = JSON.parse(stored) as StudyCategory[];
    } catch {
      categories = DEFAULT_STUDY_CATEGORIES.slice();
    }
  }
  
  // 确保"其它"分类始终存在且在最后
  const otherIndex = categories.indexOf('其它');
  if (otherIndex !== -1) {
    categories.splice(otherIndex, 1);
  }
  categories.push('其它');
  
  saveStudyCategories(categories);
  return categories;
};

/**
 * 获取可管理的分类（排除"其它"）
 */
export const getManageableStudyCategories = (): StudyCategory[] => {
  const allCategories = getStudyCategories();
  return allCategories.filter(cat => cat !== '其它');
};

/**
 * 保存分类到localStorage
 */
export const saveStudyCategories = (categories: StudyCategory[]): void => {
  localStorage.setItem(STUDY_CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
};

/**
 * 保存分类顺序
 */
export const saveStudyCategoriesOrder = (categories: StudyCategory[]): void => {
  const otherIndex = categories.indexOf('其它');
  if (otherIndex !== -1) {
    categories.splice(otherIndex, 1);
  }
  categories.push('其它');
  
  saveStudyCategories(categories);
};

/**
 * 添加新分类
 */
export const addStudyCategory = (newCategory: string): boolean => {
  const trimmedCategory = newCategory.trim();
  if (!trimmedCategory) return false;
  
  const currentCategories = getStudyCategories();
  
  if (currentCategories.includes(trimmedCategory as StudyCategory)) {
    return false;
  }
  
  const otherIndex = currentCategories.indexOf('其它');
  if (otherIndex !== -1) {
    currentCategories.splice(otherIndex, 1);
  }
  
  currentCategories.push(trimmedCategory as StudyCategory);
  currentCategories.push('其它');
  
  saveStudyCategories(currentCategories);
  return true;
};

/**
 * 删除分类
 */
export const deleteStudyCategory = (categoryToDelete: StudyCategory): boolean => {
  if (categoryToDelete === '其它') {
    return false;
  }
  
  const currentCategories = getStudyCategories();
  const updatedCategories = currentCategories.filter(cat => cat !== categoryToDelete);
  
  // 将所有使用该分类的记录改为"其它"
  const records = loadStudyRecords();
  const updatedRecords = records.map(record => 
    record.category === categoryToDelete 
      ? { ...record, category: '其它' as StudyCategory }
      : record
  );
  
  saveStudyCategories(updatedCategories);
  saveStudyRecords(updatedRecords);
  return true;
};

/**
 * 修改分类名称
 */
export const updateStudyCategory = (oldCategory: StudyCategory, newCategory: string): boolean => {
  const trimmedNewCategory = newCategory.trim();
  if (!trimmedNewCategory || oldCategory === '其它') return false;
  
  const currentCategories = getStudyCategories();
  
  if (trimmedNewCategory !== oldCategory && currentCategories.includes(trimmedNewCategory as StudyCategory)) {
    return false;
  }
  
  const updatedCategories = currentCategories.map(cat => 
    cat === oldCategory ? (trimmedNewCategory as StudyCategory) : cat
  );
  
  const otherIndex = updatedCategories.indexOf('其它');
  if (otherIndex !== -1 && otherIndex !== updatedCategories.length - 1) {
    updatedCategories.splice(otherIndex, 1);
    updatedCategories.push('其它');
  }
  
  const records = loadStudyRecords();
  const updatedRecords = records.map(record => 
    record.category === oldCategory 
      ? { ...record, category: trimmedNewCategory as StudyCategory }
      : record
  );
  
  saveStudyCategories(updatedCategories);
  saveStudyRecords(updatedRecords);
  return true;
};

/**
 * 检查分类是否有相关记录
 */
export const studyCategoryHasRecords = (category: StudyCategory): boolean => {
  const records = loadStudyRecords();
  return records.some(record => record.category === category);
};

/**
 * 重置学习分类为默认分类
 */
export const resetStudyCategories = (): void => {
  const currentCategories = getStudyCategories();
  const defaultCategoriesSet = new Set(DEFAULT_STUDY_CATEGORIES);
  
  // 找出用户创建的分类（不在默认分类中的，排除"其它"）
  const userCreatedCategories = currentCategories.filter(
    cat => cat !== '其它' && !defaultCategoriesSet.has(cat)
  );
  
  // 处理用户创建的分类
  const records = loadStudyRecords();
  let updatedRecords = [...records];
  
  userCreatedCategories.forEach(category => {
    const hasRecords = records.some(record => record.category === category);
    
    if (hasRecords) {
      // 有记录，将记录归到"其它"
      updatedRecords = updatedRecords.map(record =>
        record.category === category
          ? { ...record, category: '其它' as StudyCategory }
          : record
      );
    }
    // 没有记录的分类直接删除，不需要处理
  });
  
  // 保存更新后的记录
  saveStudyRecords(updatedRecords);
  
  // 恢复为默认分类
  saveStudyCategories([...DEFAULT_STUDY_CATEGORIES]);
};