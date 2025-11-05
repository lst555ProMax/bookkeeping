// 抽卡相关类型定义

// 抽卡类型枚举
export enum CardType {
  ENTREPRENEURIAL_ANALYSIS = 'entrepreneurial_analysis', // 创业分析
  ECONOMIC_SOCIETY = 'economic_society',                 // 经济社会
  AI_DEVELOPMENT = 'ai_development',                     // AI发展
  MUSIC_HISTORY = 'music_history',                       // 音乐发展史
  ART_HISTORY = 'art_history',                           // 艺术发展史
  TYPOLOGY = 'typology',                                 // 类型学
  HEALTH = 'health',                                     // 健康养生
  ART_APPRECIATION = 'art_appreciation',                 // 艺术欣赏
  MUSIC_APPRECIATION = 'music_appreciation',             // 音乐欣赏
  READING = 'reading',                                   // 读书
  COMEDY = 'comedy',                                     // 喜剧/脱口秀
  PUBG = 'pubg',                                         // 吃鸡
  MOVIE = 'movie',                                       // 看电影
  ENGLISH_LISTENING = 'english_listening',               // 英语学习
  FRONTEND_BACKEND = 'frontend_backend',                 // 前后端开发
  AI_ALGORITHM = 'ai_algorithm',                         // AI/Agent
  ALGORITHM = 'algorithm',                               // 算法
  CITYWALK = 'citywalk',                                 // citywalk
  EXERCISE = 'exercise',                                 // 运动跑步
  CUSTOM = 'custom'                                      // 自定义
}

// 抽卡类型中文映射
export const CARD_TYPE_LABELS: Record<CardType, string> = {
  [CardType.ENTREPRENEURIAL_ANALYSIS]: '创业分析',
  [CardType.ECONOMIC_SOCIETY]: '经济社会',
  [CardType.AI_DEVELOPMENT]: 'AI发展',
  [CardType.MUSIC_HISTORY]: '音乐发展史',
  [CardType.ART_HISTORY]: '艺术发展史',
  [CardType.TYPOLOGY]: '类型学',
  [CardType.HEALTH]: '健康养生',
  [CardType.ART_APPRECIATION]: '艺术欣赏',
  [CardType.MUSIC_APPRECIATION]: '音乐欣赏',
  [CardType.READING]: '读书',
  [CardType.COMEDY]: '喜剧/脱口秀',
  [CardType.PUBG]: '吃鸡',
  [CardType.MOVIE]: '看电影',
  [CardType.ENGLISH_LISTENING]: '英语学习',
  [CardType.FRONTEND_BACKEND]: '前后端开发',
  [CardType.AI_ALGORITHM]: 'AI/Agent',
  [CardType.ALGORITHM]: '算法',
  [CardType.CITYWALK]: 'citywalk',
  [CardType.EXERCISE]: '运动跑步',
  [CardType.CUSTOM]: '自定义'
};

// 抽卡分类
export enum CardCategory {
  RESEARCH = 'research',     // 研究向
  APPRECIATION = 'appreciation', // 欣赏向
  LEARNING = 'learning',     // 学习向
  ENTERTAINMENT = 'entertainment', // 娱乐向
  OUTDOOR = 'outdoor',       // 户外向
  CUSTOM = 'custom'          // 自定义
}

// 抽卡分类中文映射
export const CARD_CATEGORY_LABELS: Record<CardCategory, string> = {
  [CardCategory.RESEARCH]: '研究向',
  [CardCategory.APPRECIATION]: '欣赏向',
  [CardCategory.LEARNING]: '学习向',
  [CardCategory.ENTERTAINMENT]: '娱乐向',
  [CardCategory.OUTDOOR]: '户外向',
  [CardCategory.CUSTOM]: '自定义'
};

// 抽卡记录接口
export interface CardDrawRecord {
  id: string;
  date: string; // YYYY-MM-DD格式
  cardType: CardType;
  category: CardCategory;
  customContent?: string; // 自定义卡片内容
  createdAt: Date;
}

// 活动项配置接口（二级活动）
export interface ActivityItem {
  id: string;
  name: string;
  probability: number; // 概率（0-1之间）
  cardType: CardType;
}

// 活动分类配置接口（一级分类）
export interface ActivityCategoryConfig {
  id: string;
  name: string;
  category: CardCategory;
  totalProbability: number; // 该分类的总概率（0-1之间）
  items: ActivityItem[];
}
