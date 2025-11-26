import { useState, useEffect } from 'react';

/**
 * 首次加载检测 Hook
 * 用于区分页面刷新和页面切换，页面刷新时清除表单数据
 * @param sessionKey sessionStorage 键名
 * @param storageKey localStorage 键名（用于清除表单数据）
 * @returns 是否是首次加载
 */
export function useFirstLoad(sessionKey: string, storageKey?: string) {
  const [isFirstLoad, setIsFirstLoad] = useState(() => {
    const initialized = sessionStorage.getItem(sessionKey);
    if (!initialized) {
      sessionStorage.setItem(sessionKey, 'true');
      // 首次加载时清除 localStorage 中的表单数据
      if (storageKey) {
        localStorage.removeItem(storageKey);
      }
      return true;
    }
    return false;
  });

  useEffect(() => {
    // 监听页面卸载，清除标记（刷新时会重新设置）
    const handleBeforeUnload = () => {
      sessionStorage.removeItem(sessionKey);
      // 刷新时清除表单数据
      if (storageKey) {
        localStorage.removeItem(storageKey);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionKey, storageKey]);

  return isFirstLoad;
}

