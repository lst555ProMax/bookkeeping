import { ExpenseRecord, ExpenseCategory } from '../../types';
import { ApiResponse, PaginationResponse } from './types';
// import request from '../request'; // 将来使用

/**
 * 支出记录API请求参数接口
 */

// 创建支出记录请求参数
export interface CreateExpenseParams {
  date: string; // YYYY-MM-DD
  amount: number;
  category: ExpenseCategory;
  description?: string;
}

// 更新支出记录请求参数
export interface UpdateExpenseParams {
  date?: string;
  amount?: number;
  category?: ExpenseCategory;
  description?: string;
}

// 查询支出记录请求参数
export interface GetExpensesParams {
  // 分页参数
  page?: number;
  limit?: number;
  
  // 日期范围参数
  startDate?: string;
  endDate?: string;
  
  // 排序参数
  field?: string;
  order?: 'asc' | 'desc';
  
  // 筛选参数
  category?: ExpenseCategory;
  minAmount?: number;
  maxAmount?: number;
  keyword?: string; // 描述关键词搜索
}

/**
 * 支出记录API服务类
 */
class ExpenseAPI {
  
  /**
   * 获取支出记录列表
   */
  async getExpenses(params?: GetExpensesParams): Promise<ApiResponse<PaginationResponse<ExpenseRecord>>> {
    // 将来替换为: return request.get<PaginationResponse<ExpenseRecord>>('/expenses', params);
    
    // 当前使用localStorage模拟
    return new Promise((resolve) => {
      setTimeout(() => {
        const expenses = JSON.parse(localStorage.getItem('bookkeeping-expenses') || '[]') as ExpenseRecord[];
        let filteredExpenses = expenses;
        
        // 应用过滤条件
        if (params?.startDate) {
          filteredExpenses = filteredExpenses.filter(e => e.date >= params.startDate!);
        }
        if (params?.endDate) {
          filteredExpenses = filteredExpenses.filter(e => e.date <= params.endDate!);
        }
        if (params?.category) {
          filteredExpenses = filteredExpenses.filter(e => e.category === params.category);
        }
        if (params?.keyword) {
          filteredExpenses = filteredExpenses.filter(e => 
            e.description?.includes(params.keyword!) || 
            e.category.includes(params.keyword!)
          );
        }
        if (params?.minAmount !== undefined) {
          filteredExpenses = filteredExpenses.filter(e => e.amount >= params.minAmount!);
        }
        if (params?.maxAmount !== undefined) {
          filteredExpenses = filteredExpenses.filter(e => e.amount <= params.maxAmount!);
        }
        
        // 排序
        if (params?.field && params?.order) {
          filteredExpenses.sort((a, b) => {
            let aValue: string | number, bValue: string | number;
            const field = params.field!;
            
            if (field === 'date') {
              aValue = a.date; bValue = b.date;
            } else if (field === 'amount') {
              aValue = a.amount; bValue = b.amount;
            } else if (field === 'category') {
              aValue = a.category; bValue = b.category;
            } else {
              aValue = new Date(a.createdAt).getTime();
              bValue = new Date(b.createdAt).getTime();
            }
            
            const compare = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            return params.order === 'desc' ? -compare : compare;
          });
        } else {
          filteredExpenses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        
        // 分页
        const page = params?.page || 1;
        const limit = params?.limit || 20;
        const startIndex = (page - 1) * limit;
        const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + limit);
        
        resolve({
          success: true,
          code: 200,
          message: '获取支出记录成功',
          data: {
            items: paginatedExpenses,
            total: filteredExpenses.length,
            page,
            limit,
            totalPages: Math.ceil(filteredExpenses.length / limit)
          },
          timestamp: Date.now()
        });
      }, 300);
    });
  }

  /**
   * 获取单个支出记录
   */
  async getExpenseById(id: string): Promise<ApiResponse<ExpenseRecord>> {
    // 将来替换为: return request.get<ExpenseRecord>(`/expenses/${id}`);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const expenses = JSON.parse(localStorage.getItem('bookkeeping-expenses') || '[]') as ExpenseRecord[];
        const expense = expenses.find(e => e.id === id);
        
        if (expense) {
          resolve({
            success: true,
            code: 200,
            message: '获取支出记录成功',
            data: expense,
            timestamp: Date.now()
          });
        } else {
          reject({
            success: false,
            code: 404,
            message: '支出记录不存在',
            timestamp: Date.now()
          });
        }
      }, 200);
    });
  }

  /**
   * 创建支出记录
   */
  async createExpense(params: CreateExpenseParams): Promise<ApiResponse<ExpenseRecord>> {
    // 将来替换为: return request.post<ExpenseRecord>('/expenses', params);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const newExpense: ExpenseRecord = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          date: params.date,
          amount: params.amount,
          category: params.category,
          description: params.description,
          createdAt: new Date()
        };
        
        const expenses = JSON.parse(localStorage.getItem('bookkeeping-expenses') || '[]') as ExpenseRecord[];
        expenses.push(newExpense);
        localStorage.setItem('bookkeeping-expenses', JSON.stringify(expenses));
        
        resolve({
          success: true,
          code: 201,
          message: '创建支出记录成功',
          data: newExpense,
          timestamp: Date.now()
        });
      }, 400);
    });
  }

  /**
   * 更新支出记录
   */
  async updateExpense(id: string, params: UpdateExpenseParams): Promise<ApiResponse<ExpenseRecord>> {
    // 将来替换为: return request.put<ExpenseRecord>(`/expenses/${id}`, params);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const expenses = JSON.parse(localStorage.getItem('bookkeeping-expenses') || '[]') as ExpenseRecord[];
        const index = expenses.findIndex(e => e.id === id);
        
        if (index === -1) {
          reject({
            success: false,
            code: 404,
            message: '支出记录不存在',
            timestamp: Date.now()
          });
          return;
        }
        
        expenses[index] = { ...expenses[index], ...params };
        localStorage.setItem('bookkeeping-expenses', JSON.stringify(expenses));
        
        resolve({
          success: true,
          code: 200,
          message: '更新支出记录成功',
          data: expenses[index],
          timestamp: Date.now()
        });
      }, 400);
    });
  }

  /**
   * 删除支出记录
   */
  async deleteExpense(id: string): Promise<ApiResponse<void>> {
    // 将来替换为: return request.delete<void>(`/expenses/${id}`);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const expenses = JSON.parse(localStorage.getItem('bookkeeping-expenses') || '[]') as ExpenseRecord[];
        const index = expenses.findIndex(e => e.id === id);
        
        if (index === -1) {
          reject({
            success: false,
            code: 404,
            message: '支出记录不存在',
            timestamp: Date.now()
          });
          return;
        }
        
        expenses.splice(index, 1);
        localStorage.setItem('bookkeeping-expenses', JSON.stringify(expenses));
        
        resolve({
          success: true,
          code: 200,
          message: '删除支出记录成功',
          timestamp: Date.now()
        });
      }, 300);
    });
  }

  /**
   * 批量删除支出记录
   */
  async batchDeleteExpenses(ids: string[]): Promise<ApiResponse<{ deletedCount: number }>> {
    // 将来替换为: return request.post<{deletedCount: number}>('/expenses/batch-delete', { ids });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const expenses = JSON.parse(localStorage.getItem('bookkeeping-expenses') || '[]') as ExpenseRecord[];
        const filteredExpenses = expenses.filter(e => !ids.includes(e.id));
        const deletedCount = expenses.length - filteredExpenses.length;
        
        localStorage.setItem('bookkeeping-expenses', JSON.stringify(filteredExpenses));
        
        resolve({
          success: true,
          code: 200,
          message: `批量删除成功，共删除 ${deletedCount} 条记录`,
          data: { deletedCount },
          timestamp: Date.now()
        });
      }, 500);
    });
  }
}

// 创建API实例
const expenseAPI = new ExpenseAPI();

export default expenseAPI;
export { ExpenseAPI };