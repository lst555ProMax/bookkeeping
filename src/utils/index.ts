// ==================== 通用类型定义 ====================
export * from './common/types';

// ==================== 通用工具函数 ====================
export * from './common/helpers';
export * from './common/sampleData';

// ==================== 记账模块 ====================
export * from './accounting/types';
export * from './accounting/storage';
export * from './accounting/category';
export * from './accounting/dataImportExport';

// ==================== 睡眠记录模块 ====================
export * from './sleep/types';
export * from './sleep/storage';
export * from './sleep/dataImportExport';

// ==================== 日常记录模块 ====================
export * from './daily/types';
export * from './daily/storage';
export * from './daily/dataImportExport';
export * from './daily/statistics';

// ==================== 学习记录模块 ====================
export * from './study/types';
export * from './study/storage';
export * from './study/dataImportExport';
export * from './study/category';

// ==================== 日记模块 ====================
export * from './diary/types';
export * from './diary/storage';
export * from './diary/dataImportExport';

// ==================== 音乐日记模块 ====================
// 类型定义共享（从 diary/types 导出）
// 函数通过各自的模块路径导入，避免命名冲突
// 使用方式: import { loadQuickNotes, ... } from '@/utils/music';

// ==================== 阅读日记模块 ====================
// 类型定义共享（从 diary/types 导出）
// 函数通过各自的模块路径导入，避免命名冲突
// 使用方式: import { loadQuickNotes, ... } from '@/utils/reading';

// ==================== 抽卡游戏模块 ====================
export * from './common/cardDraw/types';
export * from './common/cardDraw/storage';
export {
  loadActivityConfig,
  saveActivityConfig,
  resetActivityConfig,
  addCategory as addActivityCategory,
  deleteCategory as deleteActivityCategory,
  addActivityItem,
  updateActivityItem,
  deleteActivityItem,
  validateProbabilities,
  drawCardByConfig
} from './common/cardDraw/activityConfig';

// ==================== 运势模块 ====================
export * from './common/fortune/types';
export * from './common/fortune/storage';
export * from './common/fortune/fortuneConfig';

// ==================== 年龄计算模块 ====================
export * from './common/ageCalculator/types';
export * from './common/ageCalculator/storage';

// ==================== 向后兼容的别名导出 ====================
// 为了不破坏现有代码，保留一些常用的别名
export { 
  exportAccountingData as exportExpenses,
  importAccountingData as importExpenses 
} from './accounting/dataImportExport';

export {
  clearAllAccountingData as clearAllExpenses
} from './accounting/storage';