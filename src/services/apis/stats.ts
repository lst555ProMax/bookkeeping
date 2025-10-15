import { ExpenseRecord, ExpenseCategory } from '../../types';
import { ApiResponse } from './types';
// import request from '../request'; // 将来使用

/**
 * 统计数据响应接口
 */

// 月度统计数据
export interface MonthlyStats {
  totalExpense: number;
  totalDays: number;
  averagePerDay: number;
  categoryStats: CategoryStats[];
  dailyStats: DailyStats[];
}

// 分类统计数据
export interface CategoryStats {
  category: ExpenseCategory;
  amount: number;
  count: number;
  percentage: number;
}

// 每日统计数据
export interface DailyStats {
  date: string; // YYYY-MM-DD
  amount: number;
  count: number;
}

// 图表数据
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

// 最高/最低支出天数据
export interface TopBottomDaysData {
  topDays: DailyStats[];
  bottomDays: DailyStats[];
}

// 趋势数据
export interface TrendData {
  dates: string[];
  amounts: number[];
  counts: number[];
}

/**
 * 统计API请求参数接口
 */

// 获取统计数据参数
export interface GetStatsParams {
  startDate?: string;
  endDate?: string;
  category?: ExpenseCategory;
}

// 获取图表数据参数
export interface GetChartDataParams {
  startDate?: string;
  endDate?: string;
  chartType: 'pie' | 'bar' | 'line';
  category?: ExpenseCategory;
}

// 获取最高最低支出天参数
export interface GetTopBottomDaysParams {
  startDate?: string;
  endDate?: string;
  count?: number; // 获取的天数，默认7天
}

// 获取趋势数据参数
export interface GetTrendParams {
  startDate?: string;
  endDate?: string;
  granularity?: 'day' | 'week' | 'month'; // 时间粒度，默认按天
}

/**
 * 统计数据API服务类
 */
class StatsAPI {
  
  /**
   * 获取月度统计数据
   */
  async getMonthlyStats(params?: GetStatsParams): Promise<ApiResponse<MonthlyStats>> {
    // 将来替换为: return request.get<MonthlyStats>('/stats/monthly', params);
    
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
        
        // 计算统计数据
        const totalExpense = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const uniqueDates = new Set(filteredExpenses.map(e => e.date));
        const totalDays = uniqueDates.size;
        const averagePerDay = totalDays > 0 ? totalExpense / totalDays : 0;
        
        // 分类统计
        const categoryMap = new Map<ExpenseCategory, { amount: number; count: number }>();
        filteredExpenses.forEach(expense => {
          const existing = categoryMap.get(expense.category) || { amount: 0, count: 0 };
          categoryMap.set(expense.category, {
            amount: existing.amount + expense.amount,
            count: existing.count + 1
          });
        });
        
        const categoryStats: CategoryStats[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
          category,
          amount: data.amount,
          count: data.count,
          percentage: totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0
        })).sort((a, b) => b.amount - a.amount);
        
        // 每日统计
        const dailyMap = new Map<string, { amount: number; count: number }>();
        filteredExpenses.forEach(expense => {
          const existing = dailyMap.get(expense.date) || { amount: 0, count: 0 };
          dailyMap.set(expense.date, {
            amount: existing.amount + expense.amount,
            count: existing.count + 1
          });
        });
        
        const dailyStats: DailyStats[] = Array.from(dailyMap.entries()).map(([date, data]) => ({
          date,
          amount: data.amount,
          count: data.count
        })).sort((a, b) => a.date.localeCompare(b.date));
        
        resolve({
          success: true,
          code: 200,
          message: '获取统计数据成功',
          data: {
            totalExpense,
            totalDays,
            averagePerDay,
            categoryStats,
            dailyStats
          },
          timestamp: Date.now()
        });
      }, 200);
    });
  }

  /**
   * 获取饼图数据
   */
  async getPieChartData(params?: GetChartDataParams): Promise<ApiResponse<ChartData[]>> {
    // 将来替换为: return request.get<ChartData[]>('/stats/pie-chart', params);
    
    // 当前使用localStorage模拟  
    return this.mockAPICall(() => {
      const expenses = this.getFilteredExpenses(params);
      const categoryMap = new Map<string, number>();
      
      expenses.forEach(expense => {
        const current = categoryMap.get(expense.category) || 0;
        categoryMap.set(expense.category, current + expense.amount);
      });
      
      return Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    }, '获取饼图数据成功');
  }

  /**
   * 获取最高/最低支出天数据
   */
  async getTopBottomDays(params?: GetTopBottomDaysParams): Promise<ApiResponse<TopBottomDaysData>> {
    // 将来替换为: return request.get<TopBottomDaysData>('/stats/top-bottom-days', params);
    
    return this.mockAPICall(() => {
      const expenses = this.getFilteredExpenses(params);
      const count = params?.count || 7;
      
      const dailyMap = new Map<string, number>();
      expenses.forEach(expense => {
        const current = dailyMap.get(expense.date) || 0;
        dailyMap.set(expense.date, current + expense.amount);
      });
      
      const dailyData: DailyStats[] = Array.from(dailyMap.entries()).map(([date, amount]) => ({
        date,
        amount,
        count: expenses.filter(e => e.date === date).length
      }));
      
      const sortedByAmount = [...dailyData].sort((a, b) => b.amount - a.amount);
      return {
        topDays: sortedByAmount.slice(0, count),
        bottomDays: sortedByAmount.slice(-count).reverse()
      };
    }, '获取最高最低支出数据成功');
  }

  /**
   * 获取趋势数据
   */
  async getTrendData(params?: GetTrendParams): Promise<ApiResponse<TrendData>> {
    // 将来替换为: return request.get<TrendData>('/stats/trend', params);
    
    return this.mockAPICall(() => {
      const expenses = this.getFilteredExpenses(params);
      const dailyMap = new Map<string, { amount: number; count: number }>();
      
      expenses.forEach(expense => {
        const existing = dailyMap.get(expense.date) || { amount: 0, count: 0 };
        dailyMap.set(expense.date, {
          amount: existing.amount + expense.amount,
          count: existing.count + 1
        });
      });
      
      const sortedDates = Array.from(dailyMap.keys()).sort();
      const dates: string[] = [];
      const amounts: number[] = [];
      const counts: number[] = [];
      
      sortedDates.forEach(date => {
        const data = dailyMap.get(date)!;
        dates.push(date);
        amounts.push(data.amount);
        counts.push(data.count);
      });
      
      return { dates, amounts, counts };
    }, '获取趋势数据成功');
  }

  /**
   * 获取最近7天趋势数据
   */
  async getRecentTrend(): Promise<ApiResponse<TrendData>> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return this.getTrendData({ startDate, endDate });
  }

  /**
   * 工具方法：获取过滤后的支出记录
   */
  private getFilteredExpenses(params?: { startDate?: string; endDate?: string; category?: ExpenseCategory }): ExpenseRecord[] {
    const expenses = JSON.parse(localStorage.getItem('bookkeeping-expenses') || '[]') as ExpenseRecord[];
    let filtered = expenses;
    
    if (params?.startDate) {
      filtered = filtered.filter(e => e.date >= params.startDate!);
    }
    if (params?.endDate) {
      filtered = filtered.filter(e => e.date <= params.endDate!);
    }
    if (params?.category) {
      filtered = filtered.filter(e => e.category === params.category);
    }
    
    return filtered;
  }

  /**
   * 工具方法：模拟API调用
   */
  private mockAPICall<T>(dataGenerator: () => T, message: string): Promise<ApiResponse<T>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          code: 200,
          message,
          data: dataGenerator(),
          timestamp: Date.now()
        });
      }, 200);
    });
  }
}

// 创建API实例
const statsAPI = new StatsAPI();

export default statsAPI;
export { StatsAPI };