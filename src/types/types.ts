// 记录类型枚举
export enum RecordType {
  EXPENSE = 'expense',
  INCOME = 'income'
}

// 支出类别类型
export type ExpenseCategory = string;

// 收入类别类型
export type IncomeCategory = string;

// 默认支出类别
export const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  '餐饮',
  '零食',
  '出行',
  '旅游',
  '软件订阅',
  '医疗',
  '住房',
  '人情往来',
  '其他'
];

// 默认收入类别
export const DEFAULT_INCOME_CATEGORIES: IncomeCategory[] = [
  '工资收入',
  '奖助学金',
  '交易退款',
  '他人转账',
  '其他'
];

// 支出记录接口
export interface ExpenseRecord {
  id: string;
  date: string; // YYYY-MM-DD格式
  amount: number;
  category: ExpenseCategory;
  description?: string;
  createdAt: Date;
}

// 收入记录接口
export interface IncomeRecord {
  id: string;
  date: string; // YYYY-MM-DD格式
  amount: number;
  category: IncomeCategory;
  description?: string;
  createdAt: Date;
}

// 每日支出统计接口
export interface DailyExpense {
  date: string;
  records: ExpenseRecord[];
  total: number;
}

// 每日收入统计接口
export interface DailyIncome {
  date: string;
  records: IncomeRecord[];
  total: number;
}

// 睡眠质量等级枚举
export enum SleepQualityLevel {
  EXCELLENT = 'excellent',  // 优秀 (90-100)
  GOOD = 'good',           // 良好 (75-89)
  FAIR = 'fair',           // 一般 (60-74)
  POOR = 'poor'            // 较差 (<60)
}

// 睡眠质量等级中文映射
export const SLEEP_QUALITY_LABELS: Record<SleepQualityLevel, string> = {
  [SleepQualityLevel.EXCELLENT]: '优秀',
  [SleepQualityLevel.GOOD]: '良好',
  [SleepQualityLevel.FAIR]: '一般',
  [SleepQualityLevel.POOR]: '较差'
};

/**
 * 根据分数获取睡眠质量等级
 * @param score 睡眠质量分数 (0-100)
 * @returns 睡眠质量等级
 */
export const getSleepQualityLevel = (score: number): SleepQualityLevel => {
  if (score >= 90) return SleepQualityLevel.EXCELLENT;
  if (score >= 75) return SleepQualityLevel.GOOD;
  if (score >= 60) return SleepQualityLevel.FAIR;
  return SleepQualityLevel.POOR;
};

// 睡眠记录接口
export interface SleepRecord {
  id: string;
  date: string; // YYYY-MM-DD格式
  sleepTime: string; // HH:mm格式 - 入睡时间
  wakeTime: string; // HH:mm格式 - 醒来时间
  quality: number; // 睡眠质量分数 (0-100)
  duration?: number; // 睡眠时长（分钟），可选，可以自动计算
  notes?: string; // 备注
  createdAt: Date;
}

// 业务模式枚举
export enum BusinessMode {
  ACCOUNTING = 'accounting',  // 记账
  SLEEP = 'sleep',            // 睡眠记录
  SOFTWARE = 'software',      // 软件使用记录
  DAILY = 'daily'             // 日常记录
}

// 业务模式中文映射
export const BUSINESS_MODE_LABELS: Record<BusinessMode, string> = {
  [BusinessMode.ACCOUNTING]: '账单记录',
  [BusinessMode.SLEEP]: '睡眠记录',
  [BusinessMode.SOFTWARE]: '软件使用',
  [BusinessMode.DAILY]: '日常记录'
};

// 三餐状态枚举
export enum MealStatus {
  NOT_EATEN = 'not_eaten',           // 未吃
  EATEN_IRREGULAR = 'eaten_irregular', // 吃了但不规律
  EATEN_REGULAR = 'eaten_regular'     // 吃了且规律
}

// 三餐状态中文映射
export const MEAL_STATUS_LABELS: Record<MealStatus, string> = {
  [MealStatus.NOT_EATEN]: '未吃',
  [MealStatus.EATEN_IRREGULAR]: '不规律',
  [MealStatus.EATEN_REGULAR]: '规律'
};

// 三餐记录接口
export interface MealRecord {
  breakfast: MealStatus;
  lunch: MealStatus;
  dinner: MealStatus;
}

// 洗漱记录接口
export interface HygieneRecord {
  morningWash: boolean;  // 早上洗漱
  nightWash: boolean;    // 晚上洗漱
}

// 洗浴记录接口
export interface BathingRecord {
  shower: boolean;  // 洗澡
  hairWash: boolean; // 洗头
  footWash: boolean; // 洗脚
  faceWash: boolean; // 洗脸
}

// 日常记录接口
export interface DailyRecord {
  id: string;
  date: string; // YYYY-MM-DD格式
  meals: MealRecord; // 三餐情况
  hygiene: HygieneRecord; // 洗漱情况
  bathing: BathingRecord; // 洗浴情况
  laundry: boolean; // 洗衣服
  cleaning: boolean; // 打扫
  checkInTime?: string; // 签到时间 HH:mm格式
  checkOutTime?: string; // 签退时间 HH:mm格式
  leaveTime?: string; // 离开时间 HH:mm格式
  notes?: string; // 备注
  createdAt: Date;
}

// 浏览器使用记录接口
export interface BrowserUsageRecord {
  id: string;
  host: string; // 网站域名
  date: string; // YYYYMMDD格式
  alias?: string; // 网站别名
  cate: string; // 分类
  focus: string; // 专注时长（秒）
  time: number; // 访问次数
  createdAt: Date;
}

// 默认浏览器使用分类
export const DEFAULT_BROWSER_CATEGORIES: string[] = [
  '未分类',
  '工作',
  '学习',
  '娱乐',
  '社交',
  '购物',
  '开发',
  '新闻',
  '其他'
];

// 抽卡类型枚举
export enum CardType {
  ENTREPRENEURIAL_ANALYSIS = 'entrepreneurial_analysis', // 创业分析
  ECONOMIC_SOCIETY = 'economic_society',                 // 经济社会
  AI_DEVELOPMENT = 'ai_development',                     // AI发展
  MUSIC_HISTORY = 'music_history',                       // 音乐发展史
  ART_HISTORY = 'art_history',                           // 艺术发展史
  TYPOLOGY = 'typology',                                 // 类型学
  ART_APPRECIATION = 'art_appreciation',                 // 艺术欣赏
  MUSIC_APPRECIATION = 'music_appreciation',             // 音乐欣赏
  READING = 'reading',                                   // 读书
  PUBG = 'pubg',                                         // 吃鸡
  MOVIE = 'movie',                                       // 看电影
  COMEDY = 'comedy',                                     // 看喜剧/脱口秀
  ENGLISH_LISTENING = 'english_listening',               // 英语听力
  FRONTEND_BACKEND = 'frontend_backend',                 // 前后端开发
  AI_ALGORITHM = 'ai_algorithm',                         // AI/算法
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
  [CardType.ART_APPRECIATION]: '艺术欣赏',
  [CardType.MUSIC_APPRECIATION]: '音乐欣赏',
  [CardType.READING]: '读书',
  [CardType.PUBG]: '吃鸡',
  [CardType.MOVIE]: '看电影',
  [CardType.COMEDY]: '看喜剧/脱口秀',
  [CardType.ENGLISH_LISTENING]: '英语听力',
  [CardType.FRONTEND_BACKEND]: '前后端开发',
  [CardType.AI_ALGORITHM]: 'AI/算法',
  [CardType.CUSTOM]: '自定义'
};

// 抽卡分类
export enum CardCategory {
  RESEARCH = 'research',     // 研究向
  APPRECIATION = 'appreciation', // 欣赏向
  ENTERTAINMENT = 'entertainment', // 娱乐向
  LEARNING = 'learning',     // 学习向
  CUSTOM = 'custom'          // 自定义
}

// 抽卡分类中文映射
export const CARD_CATEGORY_LABELS: Record<CardCategory, string> = {
  [CardCategory.RESEARCH]: '研究向',
  [CardCategory.APPRECIATION]: '欣赏向',
  [CardCategory.ENTERTAINMENT]: '娱乐向',
  [CardCategory.LEARNING]: '学习向',
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