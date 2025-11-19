/**
 * 日记相关类型定义
 */

// 速记条目
export interface QuickNote {
  id: string;
  content: string;
  timestamp: number;
}

// 日记条目
export interface DiaryEntry {
  id: string;
  date: string;
  content: string;
  theme: string;
  weather: string;
  mood: string;
  font?: string; // 字体样式
  createdAt: number;
  updatedAt: number;
}

// 主题选项
export interface ThemeOption {
  name: string;
  color: string;
}

// 天气选项
export interface WeatherOption {
  label: string;
  icon: string;
}

// 心情选项
export interface MoodOption {
  label: string;
  icon: string;
}

// 预设主题颜色 - 36种颜色，6行×6列
export const PRESET_THEMES: ThemeOption[] = [
  // 第一行 - 浅色系
  { name: '米白', color: '#FFF9E6' },
  { name: '淡粉', color: '#FFE6F0' },
  { name: '浅蓝', color: '#E6F3FF' },
  { name: '薄荷', color: '#E6FFF0' },
  { name: '淡紫', color: '#F0E6FF' },
  { name: '杏色', color: '#FFE8D6' },
  // 第二行 - 柔和色系
  { name: '淡黄', color: '#FFFACD' },
  { name: '浅绿', color: '#F0FFF0' },
  { name: '玫瑰', color: '#FFE4E1' },
  { name: '天蓝', color: '#E0F6FF' },
  { name: '薰衣草', color: '#E6E6FA' },
  { name: '蜜桃', color: '#FFE5B4' },
  // 第三行 - 中等浅色系
  { name: '淡青', color: '#E0FFFF' },
  { name: '樱花', color: '#FFB6C1' },
  { name: '淡橙', color: '#FFE4B5' },
  { name: '浅灰', color: '#F5F5F5' },
  { name: '淡红', color: '#FFE4E6' },
  { name: '淡青绿', color: '#E0F5E6' },
  // 第四行 - 中等色系
  { name: '珊瑚', color: '#FF7F50' },
  { name: '天空', color: '#87CEEB' },
  { name: '薰衣草紫', color: '#DDA0DD' },
  { name: '蜜瓜', color: '#F0E68C' },
  { name: '青绿', color: '#AFEEEE' },
  { name: '粉红', color: '#FFC0CB' },
  // 第五行 - 中等深色系
  { name: '橙色', color: '#FFA500' },
  { name: '银灰', color: '#C0C0C0' },
  { name: '浅棕', color: '#DEB887' },
  { name: '浅紫', color: '#DA70D6' },
  { name: '浅青', color: '#7FFFD4' },
  { name: '浅橙', color: '#FFA07A' },
  // 第六行 - 深色系
  { name: '深粉', color: '#FF69B4' },
  { name: '深蓝', color: '#4169E1' },
  { name: '深紫', color: '#9370DB' },
  { name: '金黄', color: '#FFD700' },
  { name: '青蓝', color: '#00CED1' },
  { name: '玫红', color: '#FF1493' },
];

// 天气选项
export const WEATHER_OPTIONS: WeatherOption[] = [
  { label: '晴天', icon: '☀️' },
  { label: '多云', icon: '⛅' },
  { label: '阴天', icon: '☁️' },
  { label: '小雨', icon: '🌦️' },
  { label: '中雨', icon: '🌧️' },
  { label: '大雨', icon: '🌧️' },
  { label: '雷雨', icon: '⛈️' },
  { label: '毛毛雨', icon: '🌂' },
  { label: '小雪', icon: '🌨️' },
  { label: '大雪', icon: '❄️' },
  { label: '雨夹雪', icon: '🌨️' },
  { label: '雾', icon: '🌫️' },
  { label: '雾霾', icon: '😷' },
  { label: '大风', icon: '💨' },
  { label: '台风', icon: '🌀' },
  { label: '沙尘', icon: '🌪️' },
  { label: '冰雹', icon: '🧊' },
  { label: '彩虹', icon: '🌈' },
];

// 心情选项
export const MOOD_OPTIONS: MoodOption[] = [
  { label: '开心', icon: '😊' },
  { label: '快乐', icon: '😄' },
  { label: '大笑', icon: '😆' },
  { label: '兴奋', icon: '🤩' },
  { label: '激动', icon: '🥳' },
  { label: '平静', icon: '😌' },
  { label: '放松', icon: '😎' },
  { label: '满足', icon: '🥰' },
  { label: '感动', icon: '🥺' },
  { label: '思考', icon: '🤔' },
  { label: '困惑', icon: '😕' },
  { label: '担心', icon: '😟' },
  { label: '疲惫', icon: '😔' },
  { label: '无聊', icon: '😑' },
  { label: '失望', icon: '😞' },
  { label: '难过', icon: '😢' },
  { label: '痛苦', icon: '😭' },
  { label: '生气', icon: '😠' },
  { label: '愤怒', icon: '😡' },
  { label: '焦虑', icon: '😰' },
  { label: '惊讶', icon: '😲' },
  { label: '震惊', icon: '😱' },
  { label: '害怕', icon: '😨' },
  { label: '尴尬', icon: '😳' },
  { label: '羞涩', icon: '🙈' },
  { label: '得意', icon: '😏' },
  { label: '调皮', icon: '😜' },
  { label: '傻笑', icon: '🤪' },
  { label: '困了', icon: '😴' },
  { label: '生病', icon: '🤒' },
  { label: '受伤', icon: '🤕' },
  { label: '爱心', icon: '❤️' },
];

// 字体选项
export interface FontOption {
  label: string;
  value: string;
}

export const FONT_OPTIONS: FontOption[] = [
  // 中文字体
  { label: '楷体', value: "'Courier New', 'STKaiti', 'KaiTi', serif" },
  { label: '宋体', value: "'SimSun', 'STSong', serif" },
  { label: '黑体', value: "'SimHei', 'STHeiti', sans-serif" },
  { label: '仿宋', value: "'FangSong', 'STFangsong', serif" },
  { label: '微软雅黑', value: "'Microsoft YaHei', sans-serif" },
  { label: '思源黑体', value: "'Source Han Sans CN', 'Noto Sans CJK SC', sans-serif" },
  { label: '华文楷体', value: "'STKaiti', 'KaiTi', serif" },
  { label: '华文宋体', value: "'STSong', 'SimSun', serif" },
  { label: '华文仿宋', value: "'STFangsong', 'FangSong', serif" },
  { label: '华文黑体', value: "'STHeiti', 'SimHei', sans-serif" },
  { label: '方正舒体', value: "'FZShuTi', serif" },
  { label: '方正姚体', value: "'FZYaoti', serif" },
  // 英文字体
  { label: 'Arial', value: "Arial, sans-serif" },
  { label: 'Times New Roman', value: "'Times New Roman', serif" },
  { label: 'Courier New', value: "'Courier New', monospace" },
  { label: 'Georgia', value: "Georgia, serif" },
  { label: 'Verdana', value: "Verdana, sans-serif" },
  { label: 'Helvetica', value: "Helvetica, Arial, sans-serif" },
  { label: 'Comic Sans MS', value: "'Comic Sans MS', cursive" },
  { label: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
  { label: 'Impact', value: "Impact, sans-serif" },
  { label: 'Lucida Console', value: "'Lucida Console', monospace" },
  // 等宽字体
  { label: 'Consolas', value: "Consolas, 'Courier New', monospace" },
  { label: 'Monaco', value: "Monaco, 'Courier New', monospace" },
  { label: 'Menlo', value: "Menlo, 'Courier New', monospace" },
  // 手写风格
  { label: 'Brush Script MT', value: "'Brush Script MT', cursive" },
  { label: 'Lucida Handwriting', value: "'Lucida Handwriting', cursive" },
];
