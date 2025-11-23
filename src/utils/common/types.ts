// 通用类型定义

// 业务模式枚举
export enum BusinessMode {
  ACCOUNTING = 'accounting',  // 记账
  SLEEP = 'sleep',            // 睡眠记录
  DAILY = 'daily',            // 日常记录
  STUDY = 'study',             // 学习记录
  SOFTWARE = 'software',      // 软件使用记录
}

// 业务模式中文映射
export const BUSINESS_MODE_LABELS: Record<BusinessMode, string> = {
  [BusinessMode.ACCOUNTING]: '账单记录',
  [BusinessMode.SLEEP]: '睡眠记录',
  [BusinessMode.DAILY]: '日常记录',
  [BusinessMode.STUDY]: '学习记录',
  [BusinessMode.SOFTWARE]: '软件使用',
};

// 统一的页面模式（包含业务模式和健康模式）
export enum PageMode {
  // 业务模式
  ACCOUNTING = 'accounting',
  SLEEP = 'sleep',
  DAILY = 'daily',
  STUDY = 'study',
  SOFTWARE = 'software',
  // 健康模式
  DIARY = 'diary',
  MUSIC = 'music',
  READING = 'reading',
  MEDICAL = 'medical',
}

// 页面模式标签映射
export const PAGE_MODE_LABELS: Record<PageMode, string> = {
  [PageMode.ACCOUNTING]: '账单记录',
  [PageMode.SLEEP]: '睡眠记录',
  [PageMode.DAILY]: '日常记录',
  [PageMode.STUDY]: '学习记录',
  [PageMode.SOFTWARE]: '软件使用',
  [PageMode.DIARY]: '日记',
  [PageMode.MUSIC]: '乐记',
  [PageMode.READING]: '书记',
  [PageMode.MEDICAL]: '病记',
};

// 页面模式图标映射
export const PAGE_MODE_ICONS: Record<PageMode, string> = {
  [PageMode.ACCOUNTING]: '💰',
  [PageMode.SLEEP]: '🌙',
  [PageMode.DAILY]: '📝',
  [PageMode.STUDY]: '📚',
  [PageMode.SOFTWARE]: '💻',
  [PageMode.DIARY]: '📔',
  [PageMode.MUSIC]: '🎵',
  [PageMode.READING]: '📖',
  [PageMode.MEDICAL]: '🏥',
};

// 判断是否为业务模式
export const isBusinessMode = (mode: PageMode): boolean => {
  return [
    PageMode.ACCOUNTING,
    PageMode.SLEEP,
    PageMode.DAILY,
    PageMode.STUDY,
    PageMode.SOFTWARE,
  ].includes(mode);
};

// 判断是否为健康模式
export const isHealthMode = (mode: PageMode): boolean => {
  return [
    PageMode.DIARY,
    PageMode.MUSIC,
    PageMode.READING,
    PageMode.MEDICAL,
  ].includes(mode);
};
