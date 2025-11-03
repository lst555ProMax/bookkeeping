import { ExpenseRecord, IncomeRecord } from './types';
import { loadExpenses, addExpense, loadIncomes, addIncome } from './storage';
import { getCategories, getIncomeCategories, addCategory, addIncomeCategory } from './category';

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
 * 导出所有记账记录到JSON文件（包括支出和收入）
 * @param expenses 可选的支出记录数组，如果不提供则导出所有支出记录
 * @param incomes 可选的收入记录数组，如果不提供则导出所有收入记录
 */
export const exportAccountingData = (expenses?: ExpenseRecord[], incomes?: IncomeRecord[]): void => {
  try {
    const expensesToExport = expenses || loadExpenses();
    const incomesToExport = incomes || loadIncomes();
    
    const exportData: ExportData = {
      version: '2.0.0',
      exportDate: new Date().toISOString(),
      expenses: expensesToExport,
      incomes: incomesToExport,
      totalExpenses: expensesToExport.length,
      totalIncomes: incomesToExport.length
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    link.download = `bookkeeping-export-${dateStr}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`成功导出 ${expensesToExport.length} 条支出记录和 ${incomesToExport.length} 条收入记录`);
  } catch (error) {
    console.error('导出失败:', error);
    throw new Error('导出数据失败，请重试');
  }
};

/**
 * 只导出支出记录
 */
export const exportExpensesOnly = (expenses?: ExpenseRecord[]): void => {
  try {
    const expensesToExport = expenses || loadExpenses();
    
    const exportData: ExportData = {
      version: '2.0.0',
      exportDate: new Date().toISOString(),
      expenses: expensesToExport,
      incomes: [],
      totalExpenses: expensesToExport.length,
      totalIncomes: 0
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    link.download = `bookkeeping-expenses-${dateStr}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`成功导出 ${expensesToExport.length} 条支出记录`);
  } catch (error) {
    console.error('导出失败:', error);
    throw new Error('导出数据失败，请重试');
  }
};

/**
 * 只导出收入记录
 */
export const exportIncomesOnly = (incomes?: IncomeRecord[]): void => {
  try {
    const incomesToExport = incomes || loadIncomes();
    
    const exportData: ExportData = {
      version: '2.0.0',
      exportDate: new Date().toISOString(),
      expenses: [],
      incomes: incomesToExport,
      totalExpenses: 0,
      totalIncomes: incomesToExport.length
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    link.download = `bookkeeping-incomes-${dateStr}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`成功导出 ${incomesToExport.length} 条收入记录`);
  } catch (error) {
    console.error('导出失败:', error);
    throw new Error('导出数据失败，请重试');
  }
};

/**
 * 从JSON文件导入记账记录（包括支出和收入）
 */
export const importAccountingData = (file: File): Promise<{
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
          
          if (!importData.expenses && !importData.incomes) {
            throw new Error('无效的数据格式：缺少expenses或incomes数组');
          }
          
          // 检查缺失的分类
          const currentExpenseCategories = getCategories();
          const currentIncomeCategories = getIncomeCategories();
          
          const missingExpenseCategories = new Set<string>();
          const missingIncomeCategories = new Set<string>();
          
          if (importData.expenses && Array.isArray(importData.expenses)) {
            importData.expenses.forEach(expense => {
              if (expense.category && !currentExpenseCategories.includes(expense.category)) {
                missingExpenseCategories.add(expense.category);
              }
            });
          }
          
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
              if (!expense.id || !expense.amount || !expense.category || !expense.date) {
                skippedExpenses++;
                return;
              }
              
              if (existingExpenseIds.has(expense.id)) {
                skippedExpenses++;
                return;
              }
              
              addExpense(expense);
              importedExpenses++;
            });
          }
          
          // 导入收入记录
          if (importData.incomes && Array.isArray(importData.incomes)) {
            importData.incomes.forEach(income => {
              if (!income.id || !income.amount || !income.category || !income.date) {
                skippedIncomes++;
                return;
              }
              
              if (existingIncomeIds.has(income.id)) {
                skippedIncomes++;
                return;
              }
              
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
 * 只导入支出记录
 */
export const importExpensesOnly = (file: File): Promise<{
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
          const importData: ExportData = JSON.parse(content);
          
          if (!importData.expenses || !Array.isArray(importData.expenses)) {
            throw new Error('无效的数据格式：缺少expenses数组');
          }
          
          // 检查缺失的分类
          const currentCategories = getCategories();
          const missingCategories = new Set<string>();
          
          importData.expenses.forEach(expense => {
            if (expense.category && !currentCategories.includes(expense.category)) {
              missingCategories.add(expense.category);
            }
          });
          
          // 如果有缺失的分类，提示用户
          if (missingCategories.size > 0) {
            let message = '导入的数据中有以下支出分类没有创建：\n\n';
            message += Array.from(missingCategories).join('、') + '\n';
            message += '\n是否创建这些分类并继续导入？';
            
            const userConfirmed = window.confirm(message);
            
            if (!userConfirmed) {
              reject(new Error('用户取消导入'));
              return;
            }
            
            missingCategories.forEach(category => {
              addCategory(category);
            });
          }
          
          // 获取现有记录
          const existingExpenses = loadExpenses();
          const existingIds = new Set(existingExpenses.map(expense => expense.id));
          
          let imported = 0;
          let skipped = 0;
          
          // 导入支出记录
          importData.expenses.forEach(expense => {
            if (!expense.id || !expense.amount || !expense.category || !expense.date) {
              skipped++;
              return;
            }
            
            if (existingIds.has(expense.id)) {
              skipped++;
              return;
            }
            
            addExpense(expense);
            imported++;
          });
          
          resolve({
            imported,
            skipped,
            total: importData.expenses.length
          });
          
          console.log(`导入完成: ${imported} 条新支出记录 (${skipped} 条跳过)`);
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
 * 只导入收入记录
 */
export const importIncomesOnly = (file: File): Promise<{
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
          const importData: ExportData = JSON.parse(content);
          
          if (!importData.incomes || !Array.isArray(importData.incomes)) {
            throw new Error('无效的数据格式：缺少incomes数组');
          }
          
          // 检查缺失的分类
          const currentCategories = getIncomeCategories();
          const missingCategories = new Set<string>();
          
          importData.incomes.forEach(income => {
            if (income.category && !currentCategories.includes(income.category)) {
              missingCategories.add(income.category);
            }
          });
          
          // 如果有缺失的分类，提示用户
          if (missingCategories.size > 0) {
            let message = '导入的数据中有以下收入分类没有创建：\n\n';
            message += Array.from(missingCategories).join('、') + '\n';
            message += '\n是否创建这些分类并继续导入？';
            
            const userConfirmed = window.confirm(message);
            
            if (!userConfirmed) {
              reject(new Error('用户取消导入'));
              return;
            }
            
            missingCategories.forEach(category => {
              addIncomeCategory(category);
            });
          }
          
          // 获取现有记录
          const existingIncomes = loadIncomes();
          const existingIds = new Set(existingIncomes.map(income => income.id));
          
          let imported = 0;
          let skipped = 0;
          
          // 导入收入记录
          importData.incomes.forEach(income => {
            if (!income.id || !income.amount || !income.category || !income.date) {
              skipped++;
              return;
            }
            
            if (existingIds.has(income.id)) {
              skipped++;
              return;
            }
            
            addIncome(income);
            imported++;
          });
          
          resolve({
            imported,
            skipped,
            total: importData.incomes.length
          });
          
          console.log(`导入完成: ${imported} 条新收入记录 (${skipped} 条跳过)`);
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
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    return '请选择JSON格式的文件';
  }
  
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return '文件大小不能超过10MB';
  }
  
  return null;
};
