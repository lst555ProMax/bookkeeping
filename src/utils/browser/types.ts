// 浏览器使用记录相关类型定义

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
