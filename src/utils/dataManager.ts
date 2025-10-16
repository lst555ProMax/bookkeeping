import { ExpenseRecord, IncomeRecord } from '@/types';
import { loadExpenses, addExpense } from './storage';
import { loadIncomes, addIncome } from './incomeStorage';

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
 */
export const exportExpenses = (): void => {
  try {
    const expenses = loadExpenses();
    const incomes = loadIncomes();
    
    const exportData: ExportData = {
      version: '2.0.0', // 更新版本号以支持收入
      exportDate: new Date().toISOString(),
      expenses,
      incomes,
      totalExpenses: expenses.length,
      totalIncomes: incomes.length
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
    
    console.log(`成功导出 ${expenses.length} 条支出记录和 ${incomes.length} 条收入记录`);
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
 * 清空所有数据（谨慎使用）
 */
export const clearAllExpenses = (): number => {
  const expenses = loadExpenses();
  const count = expenses.length;
  localStorage.removeItem('bookkeeping-expenses');
  return count;
};