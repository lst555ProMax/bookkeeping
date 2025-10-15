import { ApiResponse, ApiError } from './apis/types';

/**
 * HTTP请求配置接口
 */
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string | FormData;
  timeout?: number;
}

/**
 * 请求拦截器类型
 */
type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;

/**
 * 响应拦截器类型
 */
type ResponseInterceptor = <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;

/**
 * 错误拦截器类型
 */
type ErrorInterceptor = (error: ApiError) => Promise<never> | ApiError;

/**
 * HTTP请求工具类
 */
class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    this.timeout = 10000; // 10秒超时
  }

  /**
   * 添加请求拦截器
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * 添加响应拦截器
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * 添加错误拦截器
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * 处理请求拦截器
   */
  private async processRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let processedConfig = config;
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig);
    }
    return processedConfig;
  }

  /**
   * 处理响应拦截器
   */
  private async processResponseInterceptors<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
    let processedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }
    return processedResponse;
  }

  /**
   * 处理错误拦截器
   */
  private async processErrorInterceptors(error: ApiError): Promise<never> {
    let processedError = error;
    for (const interceptor of this.errorInterceptors) {
      const result = await interceptor(processedError);
      if (result === processedError) {
        // 如果拦截器没有修改错误，继续处理
        continue;
      }
      processedError = result;
    }
    throw processedError;
  }

  /**
   * 发起HTTP请求
   */
  private async makeRequest<T>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    try {
      // 处理请求拦截器
      const processedConfig = await this.processRequestInterceptors(config);

      // 构建完整URL
      const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;

      // 构建请求配置
      const requestInit: RequestInit = {
        method: processedConfig.method || 'GET',
        headers: {
          ...this.defaultHeaders,
          ...processedConfig.headers,
        },
        body: processedConfig.body,
        signal: AbortSignal.timeout(processedConfig.timeout || this.timeout),
      };

      // 发起请求
      const response = await fetch(fullURL, requestInit);

      // 解析响应
      const responseData: ApiResponse<T> = await response.json();

      // 检查响应状态
      if (!response.ok) {
        throw new ApiError(
          responseData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          responseData
        );
      }

      // 检查业务状态
      if (!responseData.success) {
        throw new ApiError(
          responseData.message || '请求失败',
          responseData.code,
          responseData
        );
      }

      // 处理响应拦截器
      const processedResponse = await this.processResponseInterceptors(responseData);

      return processedResponse;
    } catch (error) {
      // 处理不同类型的错误
      let apiError: ApiError;
      
      if (error instanceof ApiError) {
        apiError = error;
      } else if (error instanceof Error) {
        if (error.name === 'AbortError') {
          apiError = new ApiError('请求超时', 408);
        } else if (error.name === 'TypeError') {
          apiError = new ApiError('网络错误，请检查网络连接', 0);
        } else {
          apiError = new ApiError(error.message, 500);
        }
      } else {
        apiError = new ApiError('未知错误', 500);
      }

      // 处理错误拦截器
      return this.processErrorInterceptors(apiError);
    }
  }

  /**
   * GET请求
   */
  async get<T>(url: string, params?: Record<string, string | number>): Promise<ApiResponse<T>> {
    let requestURL = url;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      requestURL += `?${searchParams.toString()}`;
    }

    return this.makeRequest<T>(requestURL, { method: 'GET' });
  }

  /**
   * POST请求
   */
  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT请求
   */
  async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE请求
   */
  async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { method: 'DELETE' });
  }

  /**
   * PATCH请求
   */
  async patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * 文件上传
   */
  async upload<T>(url: string, file: File, extraData?: Record<string, string>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (extraData) {
      Object.entries(extraData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.makeRequest<T>(url, {
      method: 'POST',
      body: formData,
      headers: {}, // 让浏览器自动设置Content-Type
    });
  }
}

// 创建默认实例
const request = new HttpClient(process.env.REACT_APP_API_BASE_URL || '/api');

// 添加默认的请求拦截器
request.addRequestInterceptor((config) => {
  // 可以在这里添加认证token等
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    };
  }
  return config;
});

// 添加默认的响应拦截器
request.addResponseInterceptor((response) => {
  // 可以在这里处理通用的响应逻辑
  console.log(`API请求成功: ${response.message}`);
  return response;
});

// 添加默认的错误拦截器
request.addErrorInterceptor((error) => {
  // 可以在这里处理通用的错误逻辑
  console.error(`API请求失败: ${error.message}`, error);
  
  // 处理认证错误
  if (error.code === 401) {
    localStorage.removeItem('authToken');
    // 可以跳转到登录页面
    // window.location.href = '/login';
  }
  
  throw error;
});

export default request;
export { HttpClient, ApiError };
export type { RequestConfig, RequestInterceptor, ResponseInterceptor, ErrorInterceptor };
