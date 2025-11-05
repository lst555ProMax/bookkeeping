// 算命/运势相关类型定义

// 运势等级枚举
export enum FortuneLevel {
  EXCELLENT = 'excellent',  // 大吉
  GOOD = 'good',           // 吉
  FAIR = 'fair',           // 中吉
  POOR = 'poor',           // 小吉
  BAD = 'bad'              // 凶
}

// 运势等级中文映射
export const FORTUNE_LEVEL_LABELS: Record<FortuneLevel, string> = {
  [FortuneLevel.EXCELLENT]: '大吉',
  [FortuneLevel.GOOD]: '吉',
  [FortuneLevel.FAIR]: '小吉',
  [FortuneLevel.POOR]: '小凶',
  [FortuneLevel.BAD]: '大凶'
};

// 运势等级颜色映射
export const FORTUNE_LEVEL_COLORS: Record<FortuneLevel, string> = {
  [FortuneLevel.EXCELLENT]: '#ff6b6b',
  [FortuneLevel.GOOD]: '#ee5a6f',
  [FortuneLevel.FAIR]: '#ffa94d',
  [FortuneLevel.POOR]: '#74c0fc',
  [FortuneLevel.BAD]: '#868e96'
};

// 运势方面枚举
export enum FortuneAspect {
  OVERALL = 'overall',       // 综合运
  CAREER = 'career',         // 事业运
  WEALTH = 'wealth',         // 财运
  LOVE = 'love',            // 爱情运
  HEALTH = 'health',        // 健康运
  STUDY = 'study'           // 学业运
}

// 运势方面中文映射
export const FORTUNE_ASPECT_LABELS: Record<FortuneAspect, string> = {
  [FortuneAspect.OVERALL]: '综合运',
  [FortuneAspect.CAREER]: '事业运',
  [FortuneAspect.WEALTH]: '财运',
  [FortuneAspect.LOVE]: '爱情运',
  [FortuneAspect.HEALTH]: '健康运',
  [FortuneAspect.STUDY]: '学业运'
};

// 单个方面的运势
export interface AspectFortune {
  aspect: FortuneAspect;
  level: FortuneLevel;
  score: number; // 0-100分
  description: string;
}

// 每日运势记录
export interface FortuneRecord {
  id: string;
  date: string; // YYYY-MM-DD格式
  overallLevel: FortuneLevel; // 综合运势等级
  overallScore: number; // 综合得分 0-100
  aspects: AspectFortune[]; // 各方面运势
  luckyColor?: string; // 幸运色
  luckyNumber?: number; // 幸运数字
  advice?: string; // 今日建议
  warning?: string; // 今日禁忌
  blessing?: string; // 今日良言/祝福
  createdAt: Date;
}
