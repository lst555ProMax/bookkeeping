/**
 * API模块统一导出
 */

// 导入所有API服务
import expenseAPI from './expense';
import statsAPI from './stats';
// import dataAPI from './data'; // 暂时注释，稍后处理

// 导入类型定义
export * from './types';
export * from './expense';
export * from './stats';
// export * from './data'; // 暂时注释，稍后处理

// 导出API实例
export {
  expenseAPI,
  statsAPI
  // dataAPI // 暂时注释，稍后处理
};

// 统一的API服务对象
export const api = {
  expense: expenseAPI,
  stats: statsAPI
  // data: dataAPI // 暂时注释，稍后处理
};

export default api;