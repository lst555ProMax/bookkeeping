// 示例数据加载工具

/**
 * 数据类型枚举
 */
export enum DataType {
  ACCOUNTING = 'accounting',
  SLEEP = 'sleep',
  DAILY = 'daily',
  STUDY = 'study',
  BROWSER = 'browser'
}

/**
 * 加载示例数据
 * @param type 数据类型
 * @returns Promise<unknown>
 */
export const loadSampleData = async (type: DataType): Promise<unknown> => {
  try {
    const response = await fetch(`/sample-data/${type}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load sample data: ${type}`);
    }
    const data = await response.json();
    
    // 转换日期字符串为 Date 对象
    return convertDates(data, type);
  } catch (error) {
    console.error(`Error loading sample data for ${type}:`, error);
    throw error;
  }
};

/**
 * 转换日期字符串为 Date 对象
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertDates = (data: any, type: DataType): unknown => {
  switch (type) {
    case DataType.ACCOUNTING:
      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expenses: data.expenses.map((record: any) => ({
          ...record,
          createdAt: new Date(record.createdAt)
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        incomes: data.incomes.map((record: any) => ({
          ...record,
          createdAt: new Date(record.createdAt)
        }))
      };
    
    case DataType.SLEEP:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((record: any) => ({
        ...record,
        createdAt: new Date(record.createdAt)
      }));
    
    case DataType.DAILY:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((record: any) => ({
        ...record,
        createdAt: new Date(record.createdAt)
      }));
    
    case DataType.STUDY:
      return data; // Study records keep createdAt as string
    
    case DataType.BROWSER:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((record: any) => ({
        ...record,
        createdAt: new Date(record.createdAt)
      }));
    
    default:
      return data;
  }
};

/**
 * 检查本地是否有数据
 * @param storageKey localStorage 的 key
 * @returns boolean
 */
export const hasLocalData = (storageKey: string): boolean => {
  const data = localStorage.getItem(storageKey);
  if (!data) return false;
  
  try {
    const parsed = JSON.parse(data);
    // 检查是否为数组且有数据，或者是对象且有属性
    if (Array.isArray(parsed)) {
      return parsed.length > 0;
    }
    if (typeof parsed === 'object' && parsed !== null) {
      // 对于 accounting 数据，检查 expenses 或 incomes 是否有数据
      if ('expenses' in parsed || 'incomes' in parsed) {
        return (parsed.expenses?.length > 0) || (parsed.incomes?.length > 0);
      }
      return Object.keys(parsed).length > 0;
    }
    return false;
  } catch {
    return false;
  }
};

/**
 * 导入示例数据到 localStorage
 * @param type 数据类型
 * @param storageKey localStorage 的 key
 * @param forceOverwrite 是否强制覆盖
 * @returns Promise<boolean> 是否成功导入
 */
export const importSampleData = async (
  type: DataType,
  storageKey: string,
  forceOverwrite: boolean = false
): Promise<boolean> => {
  try {
    // 检查是否有本地数据
    const hasData = hasLocalData(storageKey);
    
    if (hasData && !forceOverwrite) {
      // 有数据且不强制覆盖，返回 false 表示需要用户确认
      return false;
    }
    
    // 加载示例数据
    const sampleData = await loadSampleData(type);
    
    // 保存到 localStorage
    localStorage.setItem(storageKey, JSON.stringify(sampleData));
    
    return true;
  } catch (error) {
    console.error(`Error importing sample data for ${type}:`, error);
    throw error;
  }
};

/**
 * 获取存储键名映射
 */
export const getStorageKey = (type: DataType): string => {
  switch (type) {
    case DataType.ACCOUNTING:
      return 'bookkeeping_records';
    case DataType.SLEEP:
      return 'sleep_records';
    case DataType.DAILY:
      return 'daily_records';
    case DataType.STUDY:
      return 'study_records';
    case DataType.BROWSER:
      return 'browser_usage_records';
    default:
      return '';
  }
};
