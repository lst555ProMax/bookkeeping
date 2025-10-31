// 学习记录类型定义

export interface StudyRecord {
  id: string;
  date: string;              // 日期，格式：YYYY-MM-DD
  videoTitle: string;        // 视频标题
  episodeStart: number;      // 观看起始集数
  episodeEnd: number;        // 观看结束集数
  totalTime: number;         // 观看总时间（分钟）
  remark?: string;           // 备注
  createdAt: string;         // 创建时间
  updatedAt: string;         // 更新时间
}

// 学习记录表单数据类型（用于表单提交）
export interface StudyRecordFormData {
  date: string;
  videoTitle: string;
  episodeStart: number;
  episodeEnd: number;
  totalTime: number;
  remark?: string;
}
