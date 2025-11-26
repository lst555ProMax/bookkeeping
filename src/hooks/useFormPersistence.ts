import { useEffect } from 'react';

/**
 * 表单数据持久化 Hook
 * 在页面切换时保持表单数据，页面刷新时清除
 * @param storageKey localStorage 存储键名
 * @param formData 表单数据对象
 * @param isEditing 是否处于编辑模式（编辑模式下不保存）
 */
export function useFormPersistence<T extends Record<string, any>>(
  storageKey: string,
  formData: T,
  isEditing: boolean = false
) {
  // 保存表单数据到 localStorage（页面切换时保持）
  useEffect(() => {
    if (!isEditing) {
      localStorage.setItem(storageKey, JSON.stringify(formData));
    }
  }, [storageKey, formData, isEditing]);
}

/**
 * 从 localStorage 加载表单数据
 * @param storageKey localStorage 存储键名
 * @returns 保存的表单数据，如果没有则返回 null
 */
export function loadFormData<T>(storageKey: string): T | null {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      return JSON.parse(saved) as T;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * 清除表单数据
 * @param storageKey localStorage 存储键名
 */
export function clearFormData(storageKey: string): void {
  localStorage.removeItem(storageKey);
}

