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

// 预设主题颜色
export const PRESET_THEMES: ThemeOption[] = [
  { name: '米白', color: '#FFF9E6' },
  { name: '淡粉', color: '#FFE6F0' },
  { name: '浅蓝', color: '#E6F3FF' },
  { name: '薄荷', color: '#E6FFF0' },
  { name: '淡紫', color: '#F0E6FF' },
  { name: '杏色', color: '#FFE8D6' },
];

// 天气选项
export const WEATHER_OPTIONS: WeatherOption[] = [
  { label: '晴天', icon: '☀️' },
  { label: '多云', icon: '⛅' },
  { label: '阴天', icon: '☁️' },
  { label: '小雨', icon: '🌦️' },
  { label: '大雨', icon: '🌧️' },
  { label: '雷雨', icon: '⛈️' },
  { label: '下雪', icon: '❄️' },
  { label: '雾霾', icon: '🌫️' },
];

// 心情选项
export const MOOD_OPTIONS: MoodOption[] = [
  { label: '开心', icon: '😊' },
  { label: '快乐', icon: '😄' },
  { label: '平静', icon: '😌' },
  { label: '疲惫', icon: '😔' },
  { label: '难过', icon: '😢' },
  { label: '生气', icon: '😠' },
  { label: '兴奋', icon: '🤩' },
  { label: '思考', icon: '🤔' },
];

// 字体选项
export interface FontOption {
  label: string;
  value: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { label: '楷体', value: "'Courier New', 'STKaiti', 'KaiTi', serif" },
  { label: '宋体', value: "'SimSun', 'STSong', serif" },
  { label: '黑体', value: "'SimHei', 'STHeiti', sans-serif" },
  { label: '仿宋', value: "'FangSong', 'STFangsong', serif" },
  { label: '微软雅黑', value: "'Microsoft YaHei', sans-serif" },
  { label: '思源黑体', value: "'Source Han Sans CN', 'Noto Sans CJK SC', sans-serif" },
];
