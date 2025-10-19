import { ExpenseRecord, IncomeRecord, SleepRecord } from '@/types';
import { loadExpenses, addExpense } from './storage';
import { loadIncomes, addIncome } from './incomeStorage';
import { loadSleepRecords, addSleepRecord } from './sleepStorage';
import { getCategories, getIncomeCategories, addCategory, addIncomeCategory } from './categoryManager';

/**
 * 导出数据接口
 */
export interface ExportData {
  version: string;
  exportDate: string;
  expenses: ExpenseRecord[];
  incomes: IncomeRecord[];
  totalExpenses: number;
  totalIncomes: number;
}

/**
 * 导出所有记录到JSON文件（包括支出和收入）
 * @param expenses 可选的支出记录数组，如果不提供则导出所有支出记录
 * @param incomes 可选的收入记录数组，如果不提供则导出所有收入记录
 */
export const exportExpenses = (expenses?: ExpenseRecord[], incomes?: IncomeRecord[]): void => {
  try {
    const expensesToExport = expenses || loadExpenses();
    const incomesToExport = incomes || loadIncomes();
    
    const exportData: ExportData = {
      version: '2.0.0', // 更新版本号以支持收入
      exportDate: new Date().toISOString(),
      expenses: expensesToExport,
      incomes: incomesToExport,
      totalExpenses: expensesToExport.length,
      totalIncomes: incomesToExport.length
    };

    // 创建JSON字符串
    const dataStr = JSON.stringify(exportData, null, 2);
    
    // 创建Blob对象
    const blob = new Blob([dataStr], { type: 'application/json' });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 生成文件名
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    link.download = `bookkeeping-export-${dateStr}.json`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 清理URL对象
    URL.revokeObjectURL(url);
    
    console.log(`成功导出 ${expensesToExport.length} 条支出记录和 ${incomesToExport.length} 条收入记录`);
  } catch (error) {
    console.error('导出失败:', error);
    throw new Error('导出数据失败，请重试');
  }
};

/**
 * 从JSON文件导入记录（包括支出和收入）
 */
export const importExpenses = (file: File): Promise<{
  importedExpenses: number;
  importedIncomes: number;
  skippedExpenses: number;
  skippedIncomes: number;
  totalExpenses: number;
  totalIncomes: number;
}> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const importData: ExportData = JSON.parse(content);
          
          // 验证数据格式
          if (!importData.expenses && !importData.incomes) {
            throw new Error('无效的数据格式：缺少expenses或incomes数组');
          }
          
          // 检查缺失的分类
          const currentExpenseCategories = getCategories();
          const currentIncomeCategories = getIncomeCategories();
          
          const missingExpenseCategories = new Set<string>();
          const missingIncomeCategories = new Set<string>();
          
          // 检查支出记录的分类
          if (importData.expenses && Array.isArray(importData.expenses)) {
            importData.expenses.forEach(expense => {
              if (expense.category && !currentExpenseCategories.includes(expense.category)) {
                missingExpenseCategories.add(expense.category);
              }
            });
          }
          
          // 检查收入记录的分类
          if (importData.incomes && Array.isArray(importData.incomes)) {
            importData.incomes.forEach(income => {
              if (income.category && !currentIncomeCategories.includes(income.category)) {
                missingIncomeCategories.add(income.category);
              }
            });
          }
          
          // 如果有缺失的分类，提示用户
          const hasMissingCategories = missingExpenseCategories.size > 0 || missingIncomeCategories.size > 0;
          
          if (hasMissingCategories) {
            let message = '导入的数据中有以下分类没有创建：\n\n';
            
            if (missingExpenseCategories.size > 0) {
              message += '支出分类：' + Array.from(missingExpenseCategories).join('、') + '\n';
            }
            
            if (missingIncomeCategories.size > 0) {
              message += '收入分类：' + Array.from(missingIncomeCategories).join('、') + '\n';
            }
            
            message += '\n是否创建这些分类并继续导入？';
            
            const userConfirmed = window.confirm(message);
            
            if (!userConfirmed) {
              reject(new Error('用户取消导入'));
              return;
            }
            
            // 创建缺失的分类
            missingExpenseCategories.forEach(category => {
              addCategory(category);
            });
            
            missingIncomeCategories.forEach(category => {
              addIncomeCategory(category);
            });
          }
          
          // 获取现有记录
          const existingExpenses = loadExpenses();
          const existingIncomes = loadIncomes();
          const existingExpenseIds = new Set(existingExpenses.map(expense => expense.id));
          const existingIncomeIds = new Set(existingIncomes.map(income => income.id));
          
          let importedExpenses = 0;
          let skippedExpenses = 0;
          let importedIncomes = 0;
          let skippedIncomes = 0;
          
          // 导入支出记录
          if (importData.expenses && Array.isArray(importData.expenses)) {
            importData.expenses.forEach(expense => {
              // 验证必要字段
              if (!expense.id || !expense.amount || !expense.category || !expense.date) {
                skippedExpenses++;
                return;
              }
              
              // 跳过已存在的记录
              if (existingExpenseIds.has(expense.id)) {
                skippedExpenses++;
                return;
              }
              
              // 添加新记录
              addExpense(expense);
              importedExpenses++;
            });
          }
          
          // 导入收入记录
          if (importData.incomes && Array.isArray(importData.incomes)) {
            importData.incomes.forEach(income => {
              // 验证必要字段
              if (!income.id || !income.amount || !income.category || !income.date) {
                skippedIncomes++;
                return;
              }
              
              // 跳过已存在的记录
              if (existingIncomeIds.has(income.id)) {
                skippedIncomes++;
                return;
              }
              
              // 添加新记录
              addIncome(income);
              importedIncomes++;
            });
          }
          
          resolve({
            importedExpenses,
            importedIncomes,
            skippedExpenses,
            skippedIncomes,
            totalExpenses: importData.expenses?.length || 0,
            totalIncomes: importData.incomes?.length || 0
          });
          
          console.log(`导入完成: 支出 ${importedExpenses} 条新记录 (${skippedExpenses} 条跳过), 收入 ${importedIncomes} 条新记录 (${skippedIncomes} 条跳过)`);
        } catch (parseError) {
          console.error('解析文件失败:', parseError);
          reject(new Error('文件格式错误，请确保是有效的JSON文件'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('导入失败:', error);
      reject(new Error('导入数据失败，请重试'));
    }
  });
};

/**
 * 验证导入文件格式
 */
export const validateImportFile = (file: File): string | null => {
  // 检查文件类型
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    return '请选择JSON格式的文件';
  }
  
  // 检查文件大小 (限制10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return '文件大小不能超过10MB';
  }
  
  return null;
};

/**
 * 清空所有记账数据（谨慎使用）
 */
export const clearAllExpenses = (): { expenses: number; incomes: number } => {
  const expenses = loadExpenses();
  const incomes = loadIncomes();
  const expenseCount = expenses.length;
  const incomeCount = incomes.length;
  
  localStorage.removeItem('bookkeeping_expenses');
  localStorage.removeItem('bookkeeping_incomes');
  
  return { expenses: expenseCount, incomes: incomeCount };
};

/**
 * 清空所有睡眠记录（谨慎使用）
 */
export const clearAllSleepRecords = (): number => {
  const records = loadSleepRecords();
  const count = records.length;
  localStorage.removeItem('sleep_records');
  return count;
};

/**
 * 睡眠记录导出数据接口
 */
export interface SleepExportData {
  version: string;
  exportDate: string;
  sleepRecords: SleepRecord[];
  totalRecords: number;
}

/**
 * 导出睡眠记录到JSON文件
 */
export const exportSleepRecords = (): void => {
  try {
    const sleepRecords = loadSleepRecords();
    
    const exportData: SleepExportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      sleepRecords,
      totalRecords: sleepRecords.length
    };

    // 创建JSON字符串
    const dataStr = JSON.stringify(exportData, null, 2);
    
    // 创建Blob对象
    const blob = new Blob([dataStr], { type: 'application/json' });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 生成文件名
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    link.download = `sleep-records-export-${dateStr}.json`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 清理URL对象
    URL.revokeObjectURL(url);
    
    console.log(`成功导出 ${sleepRecords.length} 条睡眠记录`);
  } catch (error) {
    console.error('导出睡眠记录失败:', error);
    throw new Error('导出睡眠记录失败，请重试');
  }
};

/**
 * 从JSON文件导入睡眠记录
 */
export const importSleepRecords = (file: File): Promise<{
  imported: number;
  skipped: number;
  total: number;
}> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const importData: SleepExportData = JSON.parse(content);
          
          // 验证数据格式
          if (!importData.sleepRecords || !Array.isArray(importData.sleepRecords)) {
            throw new Error('无效的数据格式：缺少sleepRecords数组');
          }
          
          // 获取现有记录
          const existingRecords = loadSleepRecords();
          const existingIds = new Set(existingRecords.map(record => record.id));
          
          let imported = 0;
          let skipped = 0;
          
          // 导入睡眠记录
          importData.sleepRecords.forEach(record => {
            // 验证必要字段
            if (!record.id || !record.date || !record.sleepTime || !record.wakeTime || record.quality === undefined) {
              skipped++;
              return;
            }
            
            // 跳过已存在的记录
            if (existingIds.has(record.id)) {
              skipped++;
              return;
            }
            
            // 添加新记录
            addSleepRecord(record);
            imported++;
          });
          
          resolve({
            imported,
            skipped,
            total: importData.sleepRecords.length
          });
          
          console.log(`导入完成: ${imported} 条新记录 (${skipped} 条跳过)`);
        } catch (parseError) {
          console.error('解析文件失败:', parseError);
          reject(new Error('文件格式错误，请确保是有效的JSON文件'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('导入睡眠记录失败:', error);
      reject(new Error('导入睡眠记录失败，请重试'));
    }
  });
};

/**
 * 验证睡眠记录导入文件格式
 */
export const validateSleepImportFile = (file: File): string | null => {
  // 检查文件类型
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    return '请选择JSON格式的文件';
  }
  
  // 检查文件大小 (限制10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return '文件大小不能超过10MB';
  }
  
  return null;
};