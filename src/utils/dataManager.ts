import { ExpenseRecord } from '@/types';
import { loadExpenses, addExpense } from './storage';

/**
 * 导出数据接口
 */
export interface ExportData {
  version: string;
  exportDate: string;
  expenses: ExpenseRecord[];
  totalRecords: number;
}

/**
 * 导出所有支出记录到JSON文件
 */
export const exportExpenses = (): void => {
  try {
    const expenses = loadExpenses();
    
    const exportData: ExportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      expenses,
      totalRecords: expenses.length
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
    
    console.log(`成功导出 ${expenses.length} 条记录`);
  } catch (error) {
    console.error('导出失败:', error);
    throw new Error('导出数据失败，请重试');
  }
};

/**
 * 从JSON文件导入支出记录
 */
export const importExpenses = (file: File): Promise<{
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
          
          // 验证数据格式
          if (!importData.expenses || !Array.isArray(importData.expenses)) {
            throw new Error('无效的数据格式：缺少expenses数组');
          }
          
          // 获取现有记录
          const existingExpenses = loadExpenses();
          const existingIds = new Set(existingExpenses.map(expense => expense.id));
          
          let imported = 0;
          let skipped = 0;
          
          // 导入新记录
          importData.expenses.forEach(expense => {
            // 验证必要字段
            if (!expense.id || !expense.amount || !expense.category || !expense.date) {
              skipped++;
              return;
            }
            
            // 跳过已存在的记录
            if (existingIds.has(expense.id)) {
              skipped++;
              return;
            }
            
            // 添加新记录
            addExpense(expense);
            imported++;
          });
          
          resolve({
            imported,
            skipped,
            total: importData.expenses.length
          });
          
          console.log(`导入完成: ${imported} 条新记录, ${skipped} 条跳过`);
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