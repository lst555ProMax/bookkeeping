// 睡眠记录相关类型定义

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
  naps?: {
    morning?: boolean;   // 上午午睡/打盹
    noon?: boolean;      // 中午午睡/打盹
    afternoon?: boolean; // 下午午睡/打盹
    evening?: boolean;   // 晚上午睡/打盹
  };
  notes?: string; // 备注
  createdAt: Date;
}
