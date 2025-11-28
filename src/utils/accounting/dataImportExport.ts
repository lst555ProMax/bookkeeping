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
 * 验证日期格式是否为 YYYY-MM-DD，并检查日期值是否有效
 */
const isValidDate = (dateStr: string): { valid: boolean; error?: string } => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    return { valid: false, error: '格式不正确，必须是YYYY-MM-DD格式' };
  }
  
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return { valid: false, error: '格式不正确，必须是YYYY-MM-DD格式' };
  }
  
  // 检查月份是否在1-12之间
  if (month < 1 || month > 12) {
    return { valid: false, error: `月份值${month}无效，必须在1-12之间` };
  }
  
  // 检查日期是否在1-31之间（粗略检查）
  if (day < 1 || day > 31) {
    return { valid: false, error: `日期值${day}无效，必须在1-31之间` };
  }
  
  // 使用Date对象进一步验证日期是否有效（处理2月29日等情况）
  const date = new Date(dateStr);
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return { valid: false, error: '日期值无效' };
  }
  
  // 验证解析后的日期是否与输入一致（防止"2025-13-45"被解析为其他日期）
  const parsedYear = date.getFullYear();
  const parsedMonth = date.getMonth() + 1;
  const parsedDay = date.getDate();
  
  if (parsedYear !== year || parsedMonth !== month || parsedDay !== day) {
    return { valid: false, error: '日期值无效' };
  }
  
  return { valid: true };
};

/**
 * 验证日期范围：不能早于2025年10月1日，不能大于当天
 */
const isValidDateRange = (dateStr: string): { valid: boolean; error?: string } => {
  const date = new Date(dateStr);
  const minDate = new Date('2025-10-01');
  const today = new Date();
  today.setHours(23, 59, 59, 999); // 设置为今天的最后一刻
  
  if (date < minDate) {
    return { valid: false, error: '日期不能早于2025年10月1日' };
  }
  
  if (date > today) {
    return { valid: false, error: '日期不能大于今天' };
  }
  
  return { valid: true };
};

/**
 * 验证支出记录格式，返回详细的错误信息
 */
const validateExpenseRecordWithError = (record: unknown, index: number): { valid: boolean; error?: string } => {
  // 先检查是否是null或非对象类型
  if (typeof record !== 'object' || record === null) {
    return { valid: false, error: `无效的支出记录[${index}]：记录必须是对象` };
  }
  
  // 检查是否是数组（数组也是object类型，但不符合要求）
  if (Array.isArray(record)) {
    return { valid: false, error: `无效的支出记录[${index}]：记录必须是对象` };
  }
  
  const r = record as Record<string, unknown>;
  
  // 检查必需字段是否存在
  if (!('id' in r) || r.id === undefined || r.id === null) {
    return { valid: false, error: `无效的支出记录[${index}]：缺少id字段` };
  }
  if (typeof r.id !== 'string') {
    return { valid: false, error: `无效的支出记录[${index}]：id字段类型不正确，必须是字符串` };
  }
  
  if (!('date' in r) || r.date === undefined || r.date === null) {
    return { valid: false, error: `无效的支出记录[${index}]：缺少date字段` };
  }
  if (typeof r.date !== 'string') {
    return { valid: false, error: `无效的支出记录[${index}]：date字段类型不正确，必须是字符串` };
  }
  
  if (!('amount' in r) || r.amount === undefined || r.amount === null) {
    return { valid: false, error: `无效的支出记录[${index}]：缺少amount字段` };
  }
  if (typeof r.amount !== 'number') {
    return { valid: false, error: `无效的支出记录[${index}]：amount字段类型不正确，必须是数字` };
  }
  
  if (!('category' in r) || r.category === undefined || r.category === null) {
    return { valid: false, error: `无效的支出记录[${index}]：缺少category字段` };
  }
  if (typeof r.category !== 'string') {
    return { valid: false, error: `无效的支出记录[${index}]：category字段类型不正确，必须是字符串` };
  }
  
  if (!('createdAt' in r) || r.createdAt === undefined || r.createdAt === null) {
    return { valid: false, error: `无效的支出记录[${index}]：缺少createdAt字段` };
  }
  if (typeof r.createdAt !== 'string') {
    return { valid: false, error: `无效的支出记录[${index}]：createdAt字段类型不正确，必须是字符串` };
  }
  
  // 验证日期格式和值
  const dateValidation = isValidDate(r.date);
  if (!dateValidation.valid) {
    return { valid: false, error: `无效的支出记录[${index}]：date${dateValidation.error}` };
  }
  
  // 验证日期范围
  const dateRangeValidation = isValidDateRange(r.date);
  if (!dateRangeValidation.valid) {
    return { valid: false, error: `无效的支出记录[${index}]：${dateRangeValidation.error}` };
  }
  
  // 验证金额（必须为正数，且不超过1000000）
  if (!Number.isFinite(r.amount)) {
    return { valid: false, error: `无效的支出记录[${index}]：amount必须是有效数字` };
  }
  
  if (r.amount <= 0) {
    return { valid: false, error: `无效的支出记录[${index}]：amount必须大于0` };
  }
  
  if (r.amount > 1000000) {
    return { valid: false, error: `无效的支出记录[${index}]：amount不能超过1,000,000` };
  }
  
  // 验证分类（不能为空）
  if (typeof r.category !== 'string' || r.category.trim().length === 0) {
    return { valid: false, error: `无效的支出记录[${index}]：category不能为空` };
  }
  
  // 验证description（如果存在，必须是字符串，且长度不超过50）
  if (r.description !== undefined && r.description !== null) {
    if (typeof r.description !== 'string') {
      return { valid: false, error: `无效的支出记录[${index}]：description必须是字符串` };
    }
    if (r.description.length > 50) {
      return { valid: false, error: `无效的支出记录[${index}]：description长度不能超过50个字符` };
    }
  }
  
  // 验证createdAt是有效的日期字符串
  const createdAt = new Date(r.createdAt);
  if (!(createdAt instanceof Date) || isNaN(createdAt.getTime())) {
    return { valid: false, error: `无效的支出记录[${index}]：createdAt必须是有效的日期字符串` };
  }
  
  return { valid: true };
};

/**
 * 验证收入记录格式，返回详细的错误信息
 */
const validateIncomeRecordWithError = (record: unknown, index: number): { valid: boolean; error?: string } => {
  // 先检查是否是null或非对象类型
  if (typeof record !== 'object' || record === null) {
    return { valid: false, error: `无效的收入记录[${index}]：记录必须是对象` };
  }
  
  // 检查是否是数组（数组也是object类型，但不符合要求）
  if (Array.isArray(record)) {
    return { valid: false, error: `无效的收入记录[${index}]：记录必须是对象` };
  }
  
  const r = record as Record<string, unknown>;
  
  // 检查必需字段是否存在
  if (!('id' in r) || r.id === undefined || r.id === null) {
    return { valid: false, error: `无效的收入记录[${index}]：缺少id字段` };
  }
  if (typeof r.id !== 'string') {
    return { valid: false, error: `无效的收入记录[${index}]：id字段类型不正确，必须是字符串` };
  }
  
  if (!('date' in r) || r.date === undefined || r.date === null) {
    return { valid: false, error: `无效的收入记录[${index}]：缺少date字段` };
  }
  if (typeof r.date !== 'string') {
    return { valid: false, error: `无效的收入记录[${index}]：date字段类型不正确，必须是字符串` };
  }
  
  if (!('amount' in r) || r.amount === undefined || r.amount === null) {
    return { valid: false, error: `无效的收入记录[${index}]：缺少amount字段` };
  }
  if (typeof r.amount !== 'number') {
    return { valid: false, error: `无效的收入记录[${index}]：amount字段类型不正确，必须是数字` };
  }
  
  if (!('category' in r) || r.category === undefined || r.category === null) {
    return { valid: false, error: `无效的收入记录[${index}]：缺少category字段` };
  }
  if (typeof r.category !== 'string') {
    return { valid: false, error: `无效的收入记录[${index}]：category字段类型不正确，必须是字符串` };
  }
  
  if (!('createdAt' in r) || r.createdAt === undefined || r.createdAt === null) {
    return { valid: false, error: `无效的收入记录[${index}]：缺少createdAt字段` };
  }
  if (typeof r.createdAt !== 'string') {
    return { valid: false, error: `无效的收入记录[${index}]：createdAt字段类型不正确，必须是字符串` };
  }
  
  // 验证日期格式和值
  const dateValidation = isValidDate(r.date);
  if (!dateValidation.valid) {
    return { valid: false, error: `无效的收入记录[${index}]：date${dateValidation.error}` };
  }
  
  // 验证日期范围
  const dateRangeValidation = isValidDateRange(r.date);
  if (!dateRangeValidation.valid) {
    return { valid: false, error: `无效的收入记录[${index}]：${dateRangeValidation.error}` };
  }
  
  // 验证金额（必须为正数，且不超过1000000）
  if (!Number.isFinite(r.amount)) {
    return { valid: false, error: `无效的收入记录[${index}]：amount必须是有效数字` };
  }
  
  if (r.amount <= 0) {
    return { valid: false, error: `无效的收入记录[${index}]：amount必须大于0` };
  }
  
  if (r.amount > 1000000) {
    return { valid: false, error: `无效的收入记录[${index}]：amount不能超过1,000,000` };
  }
  
  // 验证分类（不能为空）
  if (typeof r.category !== 'string' || r.category.trim().length === 0) {
    return { valid: false, error: `无效的收入记录[${index}]：category不能为空` };
  }
  
  // 验证description（如果存在，必须是字符串，且长度不超过50）
  if (r.description !== undefined && r.description !== null) {
    if (typeof r.description !== 'string') {
      return { valid: false, error: `无效的收入记录[${index}]：description必须是字符串` };
    }
    if (r.description.length > 50) {
      return { valid: false, error: `无效的收入记录[${index}]：description长度不能超过50个字符` };
    }
  }
  
  // 验证createdAt是有效的日期字符串
  const createdAt = new Date(r.createdAt);
  if (!(createdAt instanceof Date) || isNaN(createdAt.getTime())) {
    return { valid: false, error: `无效的收入记录[${index}]：createdAt必须是有效的日期字符串` };
  }
  
  return { valid: true };
};

/**
 * 验证导出数据格式，返回详细的错误信息
 */
const validateExportDataWithError = (data: unknown): { valid: boolean; error?: string } => {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, error: '无效的数据格式：数据必须是JSON对象' };
  }
  
  const d = data as Record<string, unknown>;
  
  // 检查顶层字段
  if (typeof d.version !== 'string') {
    return { valid: false, error: '无效的数据格式：缺少version字段或类型不正确' };
  }
  
  if (typeof d.exportDate !== 'string') {
    return { valid: false, error: '无效的数据格式：缺少exportDate字段或类型不正确' };
  }
  
  if (typeof d.totalExpenses !== 'number') {
    return { valid: false, error: '无效的数据格式：缺少totalExpenses字段或类型不正确' };
  }
  
  if (typeof d.totalIncomes !== 'number') {
    return { valid: false, error: '无效的数据格式：缺少totalIncomes字段或类型不正确' };
  }
  
  // 检查expenses数组
  if (!Array.isArray(d.expenses)) {
    return { valid: false, error: '无效的数据格式：expenses必须是数组' };
  }
  
  // 检查incomes数组
  if (!Array.isArray(d.incomes)) {
    return { valid: false, error: '无效的数据格式：incomes必须是数组' };
  }
  
  // 验证totalExpenses和totalIncomes与实际数组长度一致
  if (d.totalExpenses !== d.expenses.length) {
    return { valid: false, error: `无效的数据格式：totalExpenses(${d.totalExpenses})与expenses数组长度(${d.expenses.length})不一致` };
  }
  
  if (d.totalIncomes !== d.incomes.length) {
    return { valid: false, error: `无效的数据格式：totalIncomes(${d.totalIncomes})与incomes数组长度(${d.incomes.length})不一致` };
  }
  
  // 检查支出记录ID唯一性
  const expenseIds = new Set<string>();
  for (let i = 0; i < d.expenses.length; i++) {
    const expense = d.expenses[i];
    if (typeof expense !== 'object' || expense === null) {
      return { valid: false, error: `无效的数据格式：expenses[${i}]不是有效的对象` };
    }
    // 检查是否是数组
    if (Array.isArray(expense)) {
      return { valid: false, error: `无效的数据格式：expenses[${i}]必须是对象` };
    }
    const exp = expense as Record<string, unknown>;
    if (!('id' in exp) || exp.id === undefined || exp.id === null) {
      return { valid: false, error: `无效的数据格式：expenses[${i}]缺少id字段` };
    }
    if (typeof exp.id !== 'string') {
      return { valid: false, error: `无效的数据格式：expenses[${i}]id字段类型不正确，必须是字符串` };
    }
    if (expenseIds.has(exp.id)) {
      return { valid: false, error: `无效的数据格式：expenses中存在重复的id "${exp.id}"` };
    }
    expenseIds.add(exp.id);
  }
  
  // 检查收入记录ID唯一性
  const incomeIds = new Set<string>();
  for (let i = 0; i < d.incomes.length; i++) {
    const income = d.incomes[i];
    if (typeof income !== 'object' || income === null) {
      return { valid: false, error: `无效的数据格式：incomes[${i}]不是有效的对象` };
    }
    // 检查是否是数组
    if (Array.isArray(income)) {
      return { valid: false, error: `无效的数据格式：incomes[${i}]必须是对象` };
    }
    const inc = income as Record<string, unknown>;
    if (!('id' in inc) || inc.id === undefined || inc.id === null) {
      return { valid: false, error: `无效的数据格式：incomes[${i}]缺少id字段` };
    }
    if (typeof inc.id !== 'string') {
      return { valid: false, error: `无效的数据格式：incomes[${i}]id字段类型不正确，必须是字符串` };
    }
    if (incomeIds.has(inc.id)) {
      return { valid: false, error: `无效的数据格式：incomes中存在重复的id "${inc.id}"` };
    }
    incomeIds.add(inc.id);
  }
  
  // 验证每个支出记录
  for (let i = 0; i < d.expenses.length; i++) {
    const expense = d.expenses[i];
    const validation = validateExpenseRecordWithError(expense, i);
    if (!validation.valid) {
      return validation;
    }
  }
  
  // 验证每个收入记录
  for (let i = 0; i < d.incomes.length; i++) {
    const income = d.incomes[i];
    const validation = validateIncomeRecordWithError(income, i);
    if (!validation.valid) {
      return validation;
    }
  }
  
  return { valid: true };
};

/**
 * 验证导出数据格式（保持向后兼容）
 */
const validateExportData = (data: unknown): data is ExportData => {
  return validateExportDataWithError(data).valid;
};

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
          const parsedData = JSON.parse(content);
          
          // 严格验证数据格式
          if (!validateExportData(parsedData)) {
            throw new Error('无效的数据格式：文件格式与导出格式不一致，请确保使用正确的导出文件');
          }
          
          const importData = parsedData as ExportData;
          
          // 检查缺失的分类
          const currentExpenseCategories = getCategories();
          const currentIncomeCategories = getIncomeCategories();
          
          const missingExpenseCategories = new Set<string>();
          const missingIncomeCategories = new Set<string>();
          
          // 检查缺失的分类（数据已经通过校验，可以直接使用）
          importData.expenses.forEach(expense => {
            if (!currentExpenseCategories.includes(expense.category)) {
              missingExpenseCategories.add(expense.category);
            }
          });
          
          importData.incomes.forEach(income => {
            if (!currentIncomeCategories.includes(income.category)) {
              missingIncomeCategories.add(income.category);
            }
          });
          
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
          
          // 导入支出记录（数据已经通过严格校验）
          importData.expenses.forEach(expense => {
            if (existingExpenseIds.has(expense.id)) {
              skippedExpenses++;
              return;
            }
            
            // 转换createdAt从字符串到Date对象
            const expenseToAdd: ExpenseRecord = {
              ...expense,
              createdAt: new Date(expense.createdAt)
            };
            
            addExpense(expenseToAdd);
            importedExpenses++;
          });
          
          // 导入收入记录（数据已经通过严格校验）
          importData.incomes.forEach(income => {
            if (existingIncomeIds.has(income.id)) {
              skippedIncomes++;
              return;
            }
            
            // 转换createdAt从字符串到Date对象
            const incomeToAdd: IncomeRecord = {
              ...income,
              createdAt: new Date(income.createdAt)
            };
            
            addIncome(incomeToAdd);
            importedIncomes++;
          });
          
          resolve({
            importedExpenses,
            importedIncomes,
            skippedExpenses,
            skippedIncomes,
            totalExpenses: importData.expenses.length,
            totalIncomes: importData.incomes.length
          });
          
          console.log(`导入完成: 支出 ${importedExpenses} 条新记录 (${skippedExpenses} 条跳过), 收入 ${importedIncomes} 条新记录 (${skippedIncomes} 条跳过)`);
        } catch (error) {
          console.error('解析文件失败:', error);
          if (error instanceof Error) {
            reject(error);
          } else {
            reject(new Error('文件格式错误，请确保是有效的JSON文件'));
          }
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
          let parsedData: unknown;
          
          try {
            parsedData = JSON.parse(content);
          } catch {
            throw new Error('文件格式错误：无法解析JSON，请确保文件是有效的JSON格式');
          }
          
          // 严格验证数据格式
          const validation = validateExportDataWithError(parsedData);
          if (!validation.valid) {
            throw new Error(validation.error || '无效的数据格式：文件格式与导出格式不一致，请确保使用正确的导出文件');
          }
          
          const importData = parsedData as ExportData;
          
          // 检查缺失的分类
          const currentCategories = getCategories();
          const missingCategories = new Set<string>();
          
          importData.expenses.forEach(expense => {
            if (!currentCategories.includes(expense.category)) {
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
          
          // 导入支出记录（数据已经通过严格校验）
          importData.expenses.forEach(expense => {
            if (existingIds.has(expense.id)) {
              skipped++;
              return;
            }
            
            // 转换createdAt从字符串到Date对象
            const expenseToAdd: ExpenseRecord = {
              ...expense,
              createdAt: new Date(expense.createdAt)
            };
            
            addExpense(expenseToAdd);
            imported++;
          });
          
          resolve({
            imported,
            skipped,
            total: importData.expenses.length
          });
          
          console.log(`导入完成: ${imported} 条新支出记录 (${skipped} 条跳过)`);
        } catch (error) {
          console.error('解析文件失败:', error);
          if (error instanceof Error) {
            reject(error);
          } else {
            reject(new Error('文件格式错误，请确保是有效的JSON文件'));
          }
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
          let parsedData: unknown;
          
          try {
            parsedData = JSON.parse(content);
          } catch {
            throw new Error('文件格式错误：无法解析JSON，请确保文件是有效的JSON格式');
          }
          
          // 严格验证数据格式
          const validation = validateExportDataWithError(parsedData);
          if (!validation.valid) {
            throw new Error(validation.error || '无效的数据格式：文件格式与导出格式不一致，请确保使用正确的导出文件');
          }
          
          const importData = parsedData as ExportData;
          
          // 检查缺失的分类
          const currentCategories = getIncomeCategories();
          const missingCategories = new Set<string>();
          
          importData.incomes.forEach(income => {
            if (!currentCategories.includes(income.category)) {
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
          
          // 导入收入记录（数据已经通过严格校验）
          importData.incomes.forEach(income => {
            if (existingIds.has(income.id)) {
              skipped++;
              return;
            }
            
            // 转换createdAt从字符串到Date对象
            const incomeToAdd: IncomeRecord = {
              ...income,
              createdAt: new Date(income.createdAt)
            };
            
            addIncome(incomeToAdd);
            imported++;
          });
          
          resolve({
            imported,
            skipped,
            total: importData.incomes.length
          });
          
          console.log(`导入完成: ${imported} 条新收入记录 (${skipped} 条跳过)`);
        } catch (error) {
          console.error('解析文件失败:', error);
          if (error instanceof Error) {
            reject(error);
          } else {
            reject(new Error('文件格式错误，请确保是有效的JSON文件'));
          }
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
