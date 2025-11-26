// ==================== 通用模块 ====================
export * from './common';

// ==================== 记账模块 ====================
export * from './accounting';
// 向后兼容的别名导出
export { 
  exportAccountingData as exportExpenses,
  importAccountingData as importExpenses 
} from './accounting';
export {
  clearAllAccountingData as clearAllExpenses
} from './accounting';

// ==================== 睡眠记录模块 ====================
export * from './sleep';

// ==================== 日常记录模块 ====================
export * from './daily';

// ==================== 学习记录模块 ====================
export * from './study';

// ==================== 日记模块 ====================
export * from './diary';

// ==================== 音乐日记模块 ====================
// 类型定义共享（从 diary/types 导出）
// 函数通过各自的模块路径导入，避免命名冲突
// 使用方式: import { loadQuickNotes, ... } from '@/utils/music';
// 注意：不在此处导出，请直接从 '@/utils/music' 导入

// ==================== 阅读日记模块 ====================
// 类型定义共享（从 diary/types 导出）
// 函数通过各自的模块路径导入，避免命名冲突
// 使用方式: import { loadQuickNotes, ... } from '@/utils/reading';
// 注意：不在此处导出，请直接从 '@/utils/reading' 导入