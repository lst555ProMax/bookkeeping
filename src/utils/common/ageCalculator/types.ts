// 年龄计算相关类型定义

// 年龄计算记录
export interface AgeRecord {
  id: string;
  date: string; // YYYY-MM-DD格式，记录计算的日期
  birthday: string; // YYYY-MM-DD HH:mm:ss格式，用户输入的生日
  createdAt: Date;
}

