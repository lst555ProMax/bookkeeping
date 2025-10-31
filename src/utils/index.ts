// ==================== 通用工具函数 ====================
export * from './helpers';
export * from './common/menuConfig';
export * from './common/sampleData';

// ==================== 记账模块 ====================
export * from './accounting/storage';
export * from './accounting/category';
export * from './accounting/dataImportExport';

// ==================== 睡眠记录模块 ====================
export * from './sleep/storage';
export * from './sleep/dataImportExport';

// ==================== 浏览器使用记录模块 ====================
export * from './browser/storage';
export * from './browser/dataImportExport';

// ==================== 日常记录模块 ====================
export * from './daily/storage';
export * from './daily/dataImportExport';
export * from './daily/statistics';

// ==================== 学习记录模块 ====================
export * from './study/storage';
export * from './study/dataImportExport';

// ==================== 抽卡游戏模块 ====================
export * from './cardDraw/storage';

// ==================== 向后兼容的别名导出 ====================
// 为了不破坏现有代码，保留一些常用的别名
export { 
  exportAccountingData as exportExpenses,
  importAccountingData as importExpenses 
} from './accounting/dataImportExport';

export {
  clearAllAccountingData as clearAllExpenses
} from './accounting/storage';