// 日常记录相关类型定义

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
  wechatSteps?: number; // 微信步数
  checkInTime?: string; // 签到时间 HH:mm格式
  checkOutTime?: string; // 签退时间 HH:mm格式
  leaveTime?: string; // 离开时间 HH:mm格式
  notes?: string; // 备注
  createdAt: Date;
}
