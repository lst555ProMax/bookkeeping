import { CardDrawRecord, CardType, CardCategory } from '@/types';

const CARD_DRAW_STORAGE_KEY = 'bookkeeping_card_draws';

/**
 * 加载所有抽卡记录
 */
export const loadCardDrawRecords = (): CardDrawRecord[] => {
  try {
    const data = localStorage.getItem(CARD_DRAW_STORAGE_KEY);
    if (!data) return [];
    
    const records = JSON.parse(data);
    return records.map((record: CardDrawRecord) => ({
      ...record,
      createdAt: new Date(record.createdAt)
    }));
  } catch (error) {
    console.error('Failed to load card draw records:', error);
    return [];
  }
};

/**
 * 保存抽卡记录
 */
const saveCardDrawRecords = (records: CardDrawRecord[]) => {
  try {
    localStorage.setItem(CARD_DRAW_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Failed to save card draw records:', error);
    throw new Error('保存抽卡记录失败');
  }
};

/**
 * 添加抽卡记录
 */
export const addCardDrawRecord = (record: CardDrawRecord) => {
  const records = loadCardDrawRecords();
  records.push(record);
  saveCardDrawRecords(records);
};

/**
 * 获取今天的抽卡记录
 */
export const getTodayCardDraw = (): CardDrawRecord | null => {
  const records = loadCardDrawRecords();
  const today = new Date().toISOString().split('T')[0];
  
  return records.find(record => record.date === today) || null;
};

/**
 * 检查今天是否已经抽过卡
 */
export const hasTodayDrawn = (): boolean => {
  return getTodayCardDraw() !== null;
};

/**
 * 清空所有抽卡记录（调试用）
 */
export const clearAllCardDrawRecords = (): number => {
  const records = loadCardDrawRecords();
  const count = records.length;
  localStorage.removeItem(CARD_DRAW_STORAGE_KEY);
  return count;
};

/**
 * 抽卡配置 - 卡片类型及概率
 */
interface CardConfig {
  type: CardType;
  probability: number;
  category: CardCategory;
}

const CARD_CONFIGS: CardConfig[] = [
  // 研究向 30%
  { type: CardType.ENTREPRENEURIAL_ANALYSIS, probability: 0.05, category: CardCategory.RESEARCH },
  { type: CardType.ECONOMIC_SOCIETY, probability: 0.05, category: CardCategory.RESEARCH },
  { type: CardType.AI_DEVELOPMENT, probability: 0.05, category: CardCategory.RESEARCH },
  { type: CardType.MUSIC_HISTORY, probability: 0.05, category: CardCategory.RESEARCH },
  { type: CardType.ART_HISTORY, probability: 0.05, category: CardCategory.RESEARCH },
  { type: CardType.TYPOLOGY, probability: 0.05, category: CardCategory.RESEARCH },
  
  // 欣赏向 30%
  { type: CardType.ART_APPRECIATION, probability: 0.10, category: CardCategory.APPRECIATION },
  { type: CardType.MUSIC_APPRECIATION, probability: 0.10, category: CardCategory.APPRECIATION },
  { type: CardType.READING, probability: 0.10, category: CardCategory.APPRECIATION },
  
  // 娱乐向 15%
  { type: CardType.PUBG, probability: 0.05, category: CardCategory.ENTERTAINMENT },
  { type: CardType.MOVIE, probability: 0.05, category: CardCategory.ENTERTAINMENT },
  { type: CardType.COMEDY, probability: 0.05, category: CardCategory.ENTERTAINMENT },
  
  // 学习向 15%
  { type: CardType.ENGLISH_LISTENING, probability: 0.05, category: CardCategory.LEARNING },
  { type: CardType.FRONTEND_BACKEND, probability: 0.05, category: CardCategory.LEARNING },
  { type: CardType.AI_ALGORITHM, probability: 0.05, category: CardCategory.LEARNING },
  
  // 自定义 10%
  { type: CardType.CUSTOM, probability: 0.10, category: CardCategory.CUSTOM }
];

/**
 * 执行抽卡
 */
export const drawCard = (): CardConfig => {
  const random = Math.random();
  let cumulative = 0;
  
  for (const config of CARD_CONFIGS) {
    cumulative += config.probability;
    if (random <= cumulative) {
      return config;
    }
  }
  
  // 兜底返回（理论上不会到达这里）
  return CARD_CONFIGS[CARD_CONFIGS.length - 1];
};
