// 示例数据加载工具

import { saveImageToIndexedDB } from './imageStorage';

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
 * 加载单张图片并转换为 base64
 * 支持 .jpg 和 .jpeg 扩展名
 */
const loadImageAsBase64 = async (imagePath: string): Promise<string> => {
  // 如果路径是 .jpg，也尝试 .jpeg
  const alternativePaths: string[] = [];
  if (imagePath.endsWith('.jpg')) {
    alternativePaths.push(imagePath.replace(/\.jpg$/, '.jpeg'));
  } else if (imagePath.endsWith('.jpeg')) {
    alternativePaths.push(imagePath.replace(/\.jpeg$/, '.jpg'));
  }
  
  const allPaths = [imagePath, ...alternativePaths];
  const basePaths = [
    '',
    `${import.meta.env.BASE_URL}`,
    `/bookkeeping/`
  ];
  
  let lastError = null;
  
  // 尝试所有路径组合
  for (const imagePathToTry of allPaths) {
    for (const basePath of basePaths) {
      const fullPath = `${basePath}${imagePathToTry}`;
      try {
        const response = await fetch(fullPath);
        if (response.ok) {
          const blob = await response.blob();
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64String = reader.result as string;
              resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }
      } catch (error) {
        lastError = error;
      }
    }
  }
  
  throw new Error(`Failed to load image ${imagePath}. Last error: ${lastError}`);
};

/**
 * 并行加载图片并保存到 IndexedDB（通用函数，支持乐记和书记）
 */
const loadEntryImagesInParallel = async (
  entries: Array<Record<string, unknown>>,
  totalImages: number,
  onProgressUpdate?: (current: number, total: number) => void
): Promise<void> => {
  // 过滤出有 imagePath 的条目
  const entriesToLoad = entries.filter(e => {
    const imagePath = e.imagePath as string | undefined;
    const entryId = e.id as string | undefined;
    return imagePath && entryId;
  });
  
  if (entriesToLoad.length === 0) {
    return;
  }
  
  let loadedCount = 0;
  
  // 使用原子计数器确保进度更新准确
  const updateProgress = () => {
    loadedCount++;
    if (onProgressUpdate) {
      onProgressUpdate(loadedCount, totalImages);
    }
  };
  
  // 并行加载所有图片（使用 Promise.allSettled 以便部分失败不影响整体）
  const loadPromises = entriesToLoad.map(async (entry) => {
    const imagePath = entry.imagePath as string;
    const entryId = entry.id as string;
    
    try {
      // 加载图片并转换为 base64
      const base64Image = await loadImageAsBase64(imagePath);
      
      // 保存到 IndexedDB
      await saveImageToIndexedDB(entryId, base64Image);
      
      // 更新进度
      updateProgress();
      
      return { success: true, entryId };
    } catch (error) {
      console.error(`加载图片失败 (${entryId}, ${imagePath}):`, error);
      updateProgress();
      return { success: false, entryId, error };
    }
  });
  
  // 等待所有图片加载完成
  const results = await Promise.allSettled(loadPromises);
  
  // 统计结果
  const successCount = results.filter(r => 
    r.status === 'fulfilled' && r.value.success
  ).length;
  const failCount = entriesToLoad.length - successCount;
  
  if (failCount > 0) {
    console.warn(`部分图片加载失败: ${failCount} 张，但不影响数据使用`);
  }
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
    
    // 收集所有需要加载图片的条目
    const allEntriesWithImages: Array<Record<string, unknown>> = [];
    
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
            
            // 收集有 imagePath 的条目，稍后统一加载
            if (typeof rawData === 'object' && rawData !== null) {
              const obj = rawData as Record<string, unknown>;
              const entries = (obj.musicEntries || []) as Array<Record<string, unknown>>;
              const entriesWithImagePath = entries.filter(e => e.imagePath && typeof e.imagePath === 'string');
              allEntriesWithImages.push(...entriesWithImagePath);
            }
            break;
            
          case 'reading-excerpts':
            result = await importReadingExcerptsOnly(file);
            console.log(`✓ 摘抄导入: ${result.imported}条新增, ${result.skipped}条跳过`);
            break;
            
          case 'reading-entries':
            result = await importReadingEntriesOnly(file);
            console.log(`✓ 书记导入: ${result.imported}条新增, ${result.skipped}条跳过`);
            
            // 收集有 imagePath 的条目，稍后统一加载
            if (typeof rawData === 'object' && rawData !== null) {
              const obj = rawData as Record<string, unknown>;
              const entries = (obj.readingEntries || []) as Array<Record<string, unknown>>;
              const entriesWithImagePath = entries.filter(e => e.imagePath && typeof e.imagePath === 'string');
              allEntriesWithImages.push(...entriesWithImagePath);
            }
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
    
    // 统一加载所有图片（乐记+书记）
    if (allEntriesWithImages.length > 0) {
      console.log(`开始并行加载 ${allEntriesWithImages.length} 张图片（乐记+书记）...`);
      const totalImages = allEntriesWithImages.length;
      
      // 更新进度显示的回调函数
      const updateProgress = (current: number, total: number) => {
        const progress = Math.round((current / total) * 100);
        updateLoadingOverlay(`正在导入示例数据...\n\n正在并行加载图片: ${current}/${total} (${progress}%)\n请勿刷新界面，耐心等待`);
      };
      
      updateLoadingOverlay(`正在导入示例数据...\n\n正在并行加载 ${totalImages} 张图片（乐记+书记）...\n请勿刷新界面，耐心等待`);
      
      await loadEntryImagesInParallel(allEntriesWithImages, totalImages, updateProgress);
      console.log(`✓ 所有图片加载完成`);
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
 * 显示加载提示
 */
const showLoadingOverlay = (message: string): HTMLDivElement => {
  const overlay = document.createElement('div');
  overlay.id = 'sample-data-loading-overlay';
  overlay.innerHTML = `
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <div class="loading-message">${message}</div>
    </div>
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    #sample-data-loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      animation: fadeIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .loading-content {
      text-align: center;
      color: white;
      padding: 40px;
      background: rgba(42, 42, 42, 0.95);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      max-width: 400px;
    }
    
    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(100, 108, 255, 0.2);
      border-top-color: #646cff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .loading-message {
      font-size: 16px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.9);
      white-space: pre-line;
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(overlay);
  return overlay;
};

/**
 * 更新加载提示消息
 */
const updateLoadingOverlay = (message: string): void => {
  const overlay = document.getElementById('sample-data-loading-overlay');
  if (overlay) {
    const messageElement = overlay.querySelector('.loading-message');
    if (messageElement) {
      messageElement.textContent = message;
    }
  }
};

/**
 * 移除加载提示
 */
const hideLoadingOverlay = (): void => {
  const overlay = document.getElementById('sample-data-loading-overlay');
  if (overlay) {
    overlay.remove();
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
  
  // 只在用户确认时导入数据
  if (userConfirmed) {
    try {
      // 显示加载提示
      showLoadingOverlay('正在导入示例数据...\n\n导入时长受网络影响较大，请勿刷新界面，耐心等待直到提示成功为止');
      
      await importAllSampleData();
      
      // 导入成功后才标记为已导入
      setSampleDataImported(true);
      
      hideLoadingOverlay();
      alert('示例数据导入成功！页面将自动刷新以显示数据。');
      window.location.reload();
    } catch (error) {
      hideLoadingOverlay();
      console.error('导入示例数据失败:', error);
      alert('导入示例数据时发生错误，请检查控制台了解详情。');
    }
  } else {
    // 用户取消也标记已提示过，避免重复弹窗
    setSampleDataImported(true);
    console.log('用户取消导入示例数据');
  }
};
