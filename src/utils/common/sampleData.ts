// 示例数据加载工具

/**
 * 示例数据导入状态的 localStorage key
 */
const SAMPLE_DATA_IMPORTED_KEY = 'sample_data_imported';

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
 * 加载账单记录的示例数据（分别加载expenses和incomes）
 */
const loadAccountingSampleData = async (): Promise<{ expenses: unknown[]; incomes: unknown[] }> => {
  const paths = [
    '/sample-data/',
    `${import.meta.env.BASE_URL}sample-data/`,
    '/bookkeeping/sample-data/'
  ];
  
  let expensesData: { expenses: unknown[]; incomes: unknown[] } | null = null;
  let incomesData: { expenses: unknown[]; incomes: unknown[] } | null = null;
  let lastError = null;
  
  for (const basePath of paths) {
    try {
      // 加载expenses.json（包含ExportData格式）
      if (!expensesData) {
        const expensesResponse = await fetch(`${basePath}expenses.json`);
        if (expensesResponse.ok) {
          expensesData = await expensesResponse.json() as { expenses: unknown[]; incomes: unknown[] };
        }
      }
      
      // 加载incomes.json（包含ExportData格式）
      if (!incomesData) {
        const incomesResponse = await fetch(`${basePath}incomes.json`);
        if (incomesResponse.ok) {
          incomesData = await incomesResponse.json() as { expenses: unknown[]; incomes: unknown[] };
        }
      }
      
      if (expensesData && incomesData) {
        break;
      }
    } catch (error) {
      lastError = error;
    }
  }
  
  if (!expensesData || !incomesData) {
    throw new Error(`Failed to load accounting sample data. Last error: ${lastError}`);
  }
  
  // 转换日期字符串为 Date 对象
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expenses: (expensesData.expenses as any[]).map((record: any) => ({
      ...record,
      createdAt: new Date(record.createdAt)
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    incomes: (incomesData.incomes as any[]).map((record: any) => ({
      ...record,
      createdAt: new Date(record.createdAt)
    }))
  };
};

/**
 * 加载示例数据
 * @param type 数据类型
 * @returns Promise<unknown>
 */
export const loadSampleData = async (type: DataType): Promise<unknown> => {
  try {
    // 账单记录特殊处理
    if (type === DataType.ACCOUNTING) {
      return await loadAccountingSampleData();
    }
    
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

/**
 * 检查是否已经导入过示例数据
 */
export const isSampleDataImported = (): boolean => {
  const value = localStorage.getItem(SAMPLE_DATA_IMPORTED_KEY);
  return value === '1';
};

/**
 * 设置示例数据导入状态
 */
export const setSampleDataImported = (imported: boolean): void => {
  localStorage.setItem(SAMPLE_DATA_IMPORTED_KEY, imported ? '1' : '0');
};

/**
 * 所有模块的示例数据配置
 */
const SAMPLE_DATA_CONFIGS = [
  // 账单记录
  { type: 'expenses', key: 'bookkeeping_expenses', file: 'expenses.json', dataKey: 'expenses' },
  { type: 'incomes', key: 'bookkeeping_incomes', file: 'incomes.json', dataKey: 'incomes' },
  
  // 睡眠记录
  { type: 'sleep', key: 'sleep_records', file: 'sleep.json', dataKey: 'sleepRecords' },
  
  // 日常记录
  { type: 'daily', key: 'daily_records', file: 'daily.json', dataKey: 'dailyRecords' },
  
  // 学习记录
  { type: 'study', key: 'study_records', file: 'study.json', dataKey: 'records' },
  
  // 日记
  { type: 'diary-entries', key: 'diary_entries', file: 'diary-entries.json', dataKey: 'diaryEntries' },
  { type: 'diary-quicknotes', key: 'diary_quick_notes', file: 'diary-quicknotes.json', dataKey: 'quickNotes' },
  
  // 音乐
  { type: 'music-entries', key: 'music_entries', file: 'music-entries.json', dataKey: 'musicEntries' },
  { type: 'music-lyrics', key: 'music_quick_notes', file: 'music-lyrics.json', dataKey: 'musicLyrics' },
  
  // 阅读
  { type: 'reading-entries', key: 'reading_entries', file: 'reading-entries.json', dataKey: 'readingEntries' },
  { type: 'reading-excerpts', key: 'reading_quick_notes', file: 'reading-excerpts.json', dataKey: 'readingExcerpts' },
  
  // 病记
  { type: 'medical-quick-notes', key: 'medical_quick_notes', file: 'medical-quick-notes.json', dataKey: 'medicalQuickNotes' },
];

/**
 * 加载单个示例数据文件
 */
const loadSampleDataFile = async (filename: string): Promise<unknown> => {
  const paths = [
    `/sample-data/${filename}`,
    `${import.meta.env.BASE_URL}sample-data/${filename}`,
    `/bookkeeping/sample-data/${filename}`
  ];
  
  let lastError = null;
  
  for (const path of paths) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      lastError = error;
    }
  }
  
  throw new Error(`Failed to load ${filename}. Last error: ${lastError}`);
};

/**
 * 清空所有模块的数据
 */
export const clearAllData = (): void => {
  console.log('开始清空所有数据...');
  
  for (const config of SAMPLE_DATA_CONFIGS) {
    localStorage.removeItem(config.key);
  }
  
  console.log('所有数据已清空');
};

/**
 * 导入所有示例数据
 * 使用各个模块真实的导入函数，确保数据验证和处理逻辑一致
 */
export const importAllSampleData = async (): Promise<void> => {
  try {
    console.log('开始导入示例数据...');
    
    // 先清空所有数据
    clearAllData();
    
    // 动态导入各模块的导入函数
    const { importQuickNotesOnly: importDiaryQuickNotes } = await import('@/utils/diary/dataImportExport');
    const { importDiaryEntriesOnly: importDiaryEntries } = await import('@/utils/diary/dataImportExport');
    const { importMusicLyricsOnly } = await import('@/utils/music/dataImportExport');
    const { importMusicEntriesOnly } = await import('@/utils/music/dataImportExport');
    const { importReadingExcerptsOnly } = await import('@/utils/reading/dataImportExport');
    const { importReadingEntriesOnly } = await import('@/utils/reading/dataImportExport');
    const { saveMedicalQuickNotes } = await import('@/utils/medical/storage');
    
    for (const config of SAMPLE_DATA_CONFIGS) {
      try {
        console.log(`正在加载 ${config.type}...`);
        const rawData = await loadSampleDataFile(config.file);
        console.log(`${config.type} 原始数据:`, rawData);
        
        // 将JSON数据转换为Blob/File对象，然后调用各模块的import函数
        const jsonString = JSON.stringify(rawData);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const file = new File([blob], config.file, { type: 'application/json' });
        
        // 根据类型调用对应的导入函数
        let result;
        switch (config.type) {
          case 'diary-quicknotes':
            result = await importDiaryQuickNotes(file);
            console.log(`✓ 日记速记导入: ${result.imported}条新增, ${result.skipped}条跳过`);
            break;
            
          case 'diary-entries':
            result = await importDiaryEntries(file);
            console.log(`✓ 日记条目导入: ${result.imported}条新增, ${result.skipped}条跳过`);
            break;
            
          case 'music-lyrics':
            result = await importMusicLyricsOnly(file);
            console.log(`✓ 歌词导入: ${result.imported}条新增, ${result.skipped}条跳过`);
            break;
            
          case 'music-entries':
            result = await importMusicEntriesOnly(file);
            console.log(`✓ 乐记导入: ${result.imported}条新增, ${result.skipped}条跳过`);
            break;
            
          case 'reading-excerpts':
            result = await importReadingExcerptsOnly(file);
            console.log(`✓ 摘抄导入: ${result.imported}条新增, ${result.skipped}条跳过`);
            break;
            
          case 'reading-entries':
            result = await importReadingEntriesOnly(file);
            console.log(`✓ 书记导入: ${result.imported}条新增, ${result.skipped}条跳过`);
            break;
            
          case 'medical-quick-notes':
            // 病记没有专门的导入函数，直接保存
            if (typeof rawData === 'object' && rawData !== null) {
              const obj = rawData as Record<string, unknown>;
              const data = obj[config.dataKey] || [];
              if (Array.isArray(data)) {
                saveMedicalQuickNotes(data);
                console.log(`✓ 病记导入成功: ${data.length}条`);
              }
            }
            break;
            
          default: {
            // 其他类型(expenses, incomes, sleep, daily, study)保持原来的简单导入逻辑
            let data = rawData;
            if (config.dataKey && typeof rawData === 'object' && rawData !== null) {
              const obj = rawData as Record<string, unknown>;
              data = obj[config.dataKey] || rawData;
            }
            localStorage.setItem(config.key, JSON.stringify(data));
            console.log(`✓ ${config.type} 数据导入成功`);
            break;
          }
        }
      } catch (error) {
        console.warn(`✗ ${config.type} 数据导入失败:`, error);
        // 继续导入其他数据，不中断流程
      }
    }
    
    // 设置导入标记
    setSampleDataImported(true);
    console.log('示例数据导入完成！');
  } catch (error) {
    console.error('导入示例数据时发生错误:', error);
    throw error;
  }
};

/**
 * 检查并提示导入示例数据
 * 在应用启动时调用此函数
 */
export const checkAndPromptSampleData = async (): Promise<void> => {
  // 检查是否已经导入过
  if (isSampleDataImported()) {
    console.log('示例数据已导入过，跳过');
    return;
  }
  
  // 显示确认对话框
  const userConfirmed = window.confirm(
    '检测到您可能是第一次访问当前网页，是否导入示例数据、开发者个人的记录以及对这个项目的详细介绍？导入示例数据将会清空您当前的所有数据。'
  );
  
  // 标记已提示过，避免下次再弹窗
  setSampleDataImported(true);
  
  // 只在用户确认时导入数据
  if (userConfirmed) {
    try {
      await importAllSampleData();
      alert('示例数据导入成功！页面将自动刷新以显示数据。');
      window.location.reload();
    } catch (error) {
      console.error('导入示例数据失败:', error);
      alert('导入示例数据时发生错误，请检查控制台了解详情。');
    }
  } else {
    console.log('用户取消导入示例数据');
  }
};
