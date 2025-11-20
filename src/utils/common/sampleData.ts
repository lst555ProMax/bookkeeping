// 示例数据加载工具

/**
 * 数据类型枚举
 */
export enum DataType {
  ACCOUNTING = 'accounting',
  SLEEP = 'sleep',
  DAILY = 'daily',
  STUDY = 'study'
}

/**
 * 加载示例数据
 * @param type 数据类型
 * @returns Promise<unknown>
 */
export const loadSampleData = async (type: DataType): Promise<unknown> => {
  try {
    // 尝试不同的路径
    const paths = [
      `/sample-data/${type}.json`,
      `${import.meta.env.BASE_URL}sample-data/${type}.json`,
      `/bookkeeping/sample-data/${type}.json`
    ];
    
    let data = null;
    let lastError = null;
    
    for (const path of paths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          data = await response.json();
          break;
        }
      } catch (error) {
        lastError = error;
      }
    }
    
    if (!data) {
      throw new Error(`Failed to load sample data: ${type}. Last error: ${lastError}`);
    }
    
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
    
    default:
      return data;
  }
};

/**
 * 检查本地是否有数据
 * @param storageKey localStorage 的 key
 * @returns boolean
 */
export const hasLocalData = (storageKey: string | string[]): boolean => {
  const keys = Array.isArray(storageKey) ? storageKey : [storageKey];
  
  for (const key of keys) {
    const data = localStorage.getItem(key);
    if (!data) continue;
    
    try {
      const parsed = JSON.parse(data);
      // 检查是否为数组且有数据
      if (Array.isArray(parsed) && parsed.length > 0) {
        return true;
      }
    } catch {
      // 忽略解析错误
    }
  }
  
  return false;
};

/**
 * 导入示例数据到 localStorage
 * @param type 数据类型
 * @param storageKey localStorage 的 key（可以是数组）
 * @param forceOverwrite 是否强制覆盖
 * @returns Promise<boolean> 是否成功导入
 */
export const importSampleData = async (
  type: DataType,
  storageKey: string | string[],
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
    if (type === DataType.ACCOUNTING) {
      // 特殊处理 accounting 数据（分为 expenses 和 incomes）
      const keys = Array.isArray(storageKey) ? storageKey : [storageKey];
      const data = sampleData as { expenses: unknown[]; incomes: unknown[] };
      if (keys.length >= 2) {
        localStorage.setItem(keys[0], JSON.stringify(data.expenses));
        localStorage.setItem(keys[1], JSON.stringify(data.incomes));
      }
    } else {
      // 其他类型直接保存
      const key = Array.isArray(storageKey) ? storageKey[0] : storageKey;
      localStorage.setItem(key, JSON.stringify(sampleData));
    }
    
    return true;
  } catch (error) {
    console.error(`Error importing sample data for ${type}:`, error);
    throw error;
  }
};

/**
 * 获取存储键名映射
 */
export const getStorageKey = (type: DataType): string | string[] => {
  switch (type) {
    case DataType.ACCOUNTING:
      return ['bookkeeping_expenses', 'bookkeeping_incomes'];
    case DataType.SLEEP:
      return 'sleep_records';
    case DataType.DAILY:
      return 'daily_records';
    case DataType.STUDY:
      return 'study_records';
    default:
      return '';
  }
};
