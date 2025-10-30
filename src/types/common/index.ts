// 通用类型定义

// 业务模式枚举
export enum BusinessMode {
  ACCOUNTING = 'accounting',  // 记账
  SLEEP = 'sleep',            // 睡眠记录
  SOFTWARE = 'software',      // 软件使用记录
  DAILY = 'daily'             // 日常记录
}

// 业务模式中文映射
export const BUSINESS_MODE_LABELS: Record<BusinessMode, string> = {
  [BusinessMode.ACCOUNTING]: '账单记录',
  [BusinessMode.SLEEP]: '睡眠记录',
  [BusinessMode.SOFTWARE]: '软件使用',
  [BusinessMode.DAILY]: '日常记录'
};
