import { formatDate } from '@/utils';

/**
 * 获取默认日期（今天）的 Hook
 * @returns 格式化的日期字符串（YYYY-MM-DD）
 */
export function useDefaultDate(): string {
  return formatDate(new Date());
}

/**
 * 获取默认日期的工具函数
 * @returns 格式化的日期字符串（YYYY-MM-DD）
 */
export function getDefaultDate(): string {
  return formatDate(new Date());
}

