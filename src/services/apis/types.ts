/**
 * API 通用响应类型定义
 */

// 通用API响应接口
export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  timestamp: number;
}

// 分页请求参数
export interface PaginationParams {
  page: number;
  limit: number;
}

// 分页响应数据
export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 日期范围查询参数
export interface DateRangeParams {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

// 排序参数
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

// API错误类型
export class ApiError extends Error {
  public code: number;
  public response?: ApiResponse;

  constructor(message: string, code: number, response?: ApiResponse) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.response = response;
  }
}