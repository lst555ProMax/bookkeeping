import { useEffect } from 'react';

/**
 * 键盘快捷键 Hook
 * @param key 快捷键组合，如 'ctrl+enter', 'escape' 等
 * @param callback 快捷键触发时的回调函数
 * @param enabled 是否启用快捷键（默认 true）
 */
export function useKeyboardShortcut(
  key: string,
  callback: (e: KeyboardEvent) => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = key.toLowerCase().split('+').map(k => k.trim());
      let match = true;

      // 检查 Ctrl/Cmd
      if (keys.includes('ctrl')) {
        match = match && (e.ctrlKey || e.metaKey);
      } else {
        match = match && !e.ctrlKey && !e.metaKey;
      }

      // 检查 Shift
      if (keys.includes('shift')) {
        match = match && e.shiftKey;
      } else {
        match = match && !e.shiftKey;
      }

      // 检查 Alt
      if (keys.includes('alt')) {
        match = match && e.altKey;
      } else {
        match = match && !e.altKey;
      }

      // 检查主键
      const mainKey = keys.find(k => !['ctrl', 'shift', 'alt', 'cmd'].includes(k));
      if (mainKey) {
        match = match && e.key.toLowerCase() === mainKey.toLowerCase();
      }

      if (match) {
        e.preventDefault();
        callback(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, callback, enabled]);
}

/**
 * 表单提交快捷键 Hook（Ctrl+Enter）
 * @param formSelector 表单选择器（如 '.expense-form__form'）
 * @param enabled 是否启用（默认 true）
 */
export function useFormSubmitShortcut(formSelector: string, enabled: boolean = true) {
  useKeyboardShortcut(
    'ctrl+enter',
    () => {
      const form = document.querySelector(formSelector) as HTMLFormElement;
      if (form) {
        form.requestSubmit();
      }
    },
    enabled
  );
}

