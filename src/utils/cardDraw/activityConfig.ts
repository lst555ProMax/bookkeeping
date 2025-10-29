import { ActivityCategoryConfig, ActivityItem, CardType, CardCategory } from '@/types';

const ACTIVITY_CONFIG_STORAGE_KEY = 'bookkeeping_activity_config';

// 默认活动配置
const DEFAULT_ACTIVITY_CONFIG: ActivityCategoryConfig[] = [
  {
    id: 'research',
    name: '研究向',
    category: CardCategory.RESEARCH,
    totalProbability: 0.30,
    items: [
      { id: 'entrepreneurial', name: '创业分析', probability: 0.05, cardType: CardType.ENTREPRENEURIAL_ANALYSIS },
      { id: 'economic', name: '经济社会', probability: 0.05, cardType: CardType.ECONOMIC_SOCIETY },
      { id: 'ai_dev', name: 'AI发展', probability: 0.05, cardType: CardType.AI_DEVELOPMENT },
      { id: 'music_history', name: '音乐发展史', probability: 0.05, cardType: CardType.MUSIC_HISTORY },
      { id: 'art_history', name: '艺术发展史', probability: 0.05, cardType: CardType.ART_HISTORY },
      { id: 'typology', name: '类型学', probability: 0.05, cardType: CardType.TYPOLOGY }
    ]
  },
  {
    id: 'appreciation',
    name: '欣赏向',
    category: CardCategory.APPRECIATION,
    totalProbability: 0.30,
    items: [
      { id: 'art_appreciation', name: '艺术欣赏', probability: 0.10, cardType: CardType.ART_APPRECIATION },
      { id: 'music_appreciation', name: '音乐欣赏', probability: 0.10, cardType: CardType.MUSIC_APPRECIATION },
      { id: 'reading', name: '读书', probability: 0.10, cardType: CardType.READING }
    ]
  },
  {
    id: 'entertainment',
    name: '娱乐向',
    category: CardCategory.ENTERTAINMENT,
    totalProbability: 0.15,
    items: [
      { id: 'pubg', name: '吃鸡', probability: 0.05, cardType: CardType.PUBG },
      { id: 'movie', name: '看电影', probability: 0.05, cardType: CardType.MOVIE },
      { id: 'comedy', name: '看喜剧/脱口秀', probability: 0.05, cardType: CardType.COMEDY }
    ]
  },
  {
    id: 'learning',
    name: '学习向',
    category: CardCategory.LEARNING,
    totalProbability: 0.15,
    items: [
      { id: 'english', name: '英语听力', probability: 0.05, cardType: CardType.ENGLISH_LISTENING },
      { id: 'dev', name: '前后端开发', probability: 0.05, cardType: CardType.FRONTEND_BACKEND },
      { id: 'ai_algo', name: 'AI/算法', probability: 0.05, cardType: CardType.AI_ALGORITHM }
    ]
  },
  {
    id: 'custom',
    name: '自定义',
    category: CardCategory.CUSTOM,
    totalProbability: 0.10,
    items: [
      { id: 'custom', name: '自定义活动', probability: 0.10, cardType: CardType.CUSTOM }
    ]
  }
];

/**
 * 加载活动配置
 */
export const loadActivityConfig = (): ActivityCategoryConfig[] => {
  try {
    const data = localStorage.getItem(ACTIVITY_CONFIG_STORAGE_KEY);
    if (!data) {
      // 如果没有配置，保存并返回默认配置
      saveActivityConfig(DEFAULT_ACTIVITY_CONFIG);
      return DEFAULT_ACTIVITY_CONFIG;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load activity config:', error);
    return DEFAULT_ACTIVITY_CONFIG;
  }
};

/**
 * 保存活动配置
 */
export const saveActivityConfig = (config: ActivityCategoryConfig[]) => {
  try {
    localStorage.setItem(ACTIVITY_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save activity config:', error);
    throw new Error('保存活动配置失败');
  }
};

/**
 * 重置为默认配置
 */
export const resetActivityConfig = (): ActivityCategoryConfig[] => {
  saveActivityConfig(DEFAULT_ACTIVITY_CONFIG);
  return DEFAULT_ACTIVITY_CONFIG;
};

/**
 * 添加一级分类
 */
export const addCategory = (name: string, category: CardCategory): ActivityCategoryConfig[] => {
  const config = loadActivityConfig();
  const newCategory: ActivityCategoryConfig = {
    id: `category_${Date.now()}`,
    name,
    category,
    totalProbability: 0,
    items: []
  };
  
  // 找到"自定义"分类的索引
  const customIndex = config.findIndex(c => c.name === '自定义');
  
  if (customIndex !== -1) {
    // 如果找到"自定义"，插入到它之前
    config.splice(customIndex, 0, newCategory);
  } else {
    // 如果没有找到"自定义"，添加到末尾
    config.push(newCategory);
  }
  
  saveActivityConfig(config);
  return config;
};

/**
 * 更新一级分类
 */
export const updateCategory = (id: string, updates: Partial<ActivityCategoryConfig>): ActivityCategoryConfig[] => {
  const config = loadActivityConfig();
  const index = config.findIndex(c => c.id === id);
  if (index !== -1) {
    config[index] = { ...config[index], ...updates };
    saveActivityConfig(config);
  }
  return config;
};

/**
 * 删除一级分类
 */
export const deleteCategory = (id: string): ActivityCategoryConfig[] => {
  const config = loadActivityConfig();
  const filtered = config.filter(c => c.id !== id);
  saveActivityConfig(filtered);
  return filtered;
};

/**
 * 添加二级活动项
 */
export const addActivityItem = (categoryId: string, name: string, cardType: CardType): ActivityCategoryConfig[] => {
  const config = loadActivityConfig();
  const category = config.find(c => c.id === categoryId);
  if (category) {
    const newItem: ActivityItem = {
      id: `item_${Date.now()}`,
      name,
      probability: 0,
      cardType
    };
    category.items.push(newItem);
    saveActivityConfig(config);
  }
  return config;
};

/**
 * 更新二级活动项
 */
export const updateActivityItem = (categoryId: string, itemId: string, updates: Partial<ActivityItem>): ActivityCategoryConfig[] => {
  const config = loadActivityConfig();
  const category = config.find(c => c.id === categoryId);
  if (category) {
    const index = category.items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      category.items[index] = { ...category.items[index], ...updates };
      saveActivityConfig(config);
    }
  }
  return config;
};

/**
 * 删除二级活动项
 */
export const deleteActivityItem = (categoryId: string, itemId: string): ActivityCategoryConfig[] => {
  const config = loadActivityConfig();
  const category = config.find(c => c.id === categoryId);
  if (category) {
    category.items = category.items.filter(item => item.id !== itemId);
    saveActivityConfig(config);
  }
  return config;
};

/**
 * 验证概率总和是否为100%
 */
export const validateProbabilities = (config: ActivityCategoryConfig[]): { valid: boolean; message: string } => {
  // 检查一级分类总概率
  const totalCategoryProbability = config.reduce((sum, cat) => sum + cat.totalProbability, 0);
  if (Math.abs(totalCategoryProbability - 1) > 0.001) {
    return {
      valid: false,
      message: `一级分类总概率为 ${(totalCategoryProbability * 100).toFixed(1)}%，必须为 100%`
    };
  }

  // 检查每个分类内的二级活动概率
  for (const category of config) {
    const itemsTotalProbability = category.items.reduce((sum, item) => sum + item.probability, 0);
    if (Math.abs(itemsTotalProbability - category.totalProbability) > 0.001) {
      return {
        valid: false,
        message: `"${category.name}" 分类的活动项概率总和为 ${(itemsTotalProbability * 100).toFixed(1)}%，应该等于该分类概率 ${(category.totalProbability * 100).toFixed(1)}%`
      };
    }
  }

  return { valid: true, message: '概率配置正确' };
};

/**
 * 根据配置执行抽卡
 */
export const drawCardByConfig = (config: ActivityCategoryConfig[]): { category: CardCategory; cardType: CardType; name: string } => {
  const random = Math.random();
  let cumulative = 0;

  // 先确定一级分类
  for (const category of config) {
    cumulative += category.totalProbability;
    if (random <= cumulative && category.items.length > 0) {
      // 在该分类内抽取二级活动
      const itemRandom = Math.random();
      let itemCumulative = 0;
      
      for (const item of category.items) {
        const itemProbabilityInCategory = category.totalProbability > 0 
          ? item.probability / category.totalProbability 
          : 0;
        itemCumulative += itemProbabilityInCategory;
        
        if (itemRandom <= itemCumulative) {
          return {
            category: category.category,
            cardType: item.cardType,
            name: item.name
          };
        }
      }
      
      // 如果没抽到（理论上不会发生），返回该分类的第一个
      const firstItem = category.items[0];
      return {
        category: category.category,
        cardType: firstItem.cardType,
        name: firstItem.name
      };
    }
  }

  // 兜底：返回第一个有活动的分类的第一个活动
  const firstValidCategory = config.find(c => c.items.length > 0);
  if (firstValidCategory && firstValidCategory.items.length > 0) {
    const firstItem = firstValidCategory.items[0];
    return {
      category: firstValidCategory.category,
      cardType: firstItem.cardType,
      name: firstItem.name
    };
  }

  // 最终兜底（不应该到达这里）
  return {
    category: CardCategory.CUSTOM,
    cardType: CardType.CUSTOM,
    name: '自定义活动'
  };
};
