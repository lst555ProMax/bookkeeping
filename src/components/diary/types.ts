// 日记相关类型定义

export interface QuickNote {
  id: string;
  content: string;
  timestamp: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  content: string;
  mood?: string;
  weather?: string;
  theme?: string; // 主题颜色
}

// 预设主题颜色
export const PRESET_THEMES = [
  { name: '默认', color: '#fffef9' },
  { name: '温馨', color: '#fff5e1' },
  { name: '清新', color: '#e8f5e9' },
  { name: '宁静', color: '#e3f2fd' },
  { name: '浪漫', color: '#fce4ec' },
  { name: '优雅', color: '#f3e5f5' },
];

// 预设天气
export const WEATHER_OPTIONS = [
  { label: '晴天', icon: '☀️' },
  { label: '多云', icon: '⛅' },
  { label: '阴天', icon: '☁️' },
  { label: '小雨', icon: '🌦️' },
  { label: '大雨', icon: '🌧️' },
  { label: '雷雨', icon: '⛈️' },
  { label: '下雪', icon: '❄️' },
  { label: '雾霾', icon: '🌫️' },
];

// 预设心情
export const MOOD_OPTIONS = [
  { label: '开心', icon: '😊' },
  { label: '快乐', icon: '😄' },
  { label: '平静', icon: '😌' },
  { label: '难过', icon: '😢' },
  { label: '生气', icon: '😠' },
  { label: '焦虑', icon: '😰' },
  { label: '疲惫', icon: '😴' },
  { label: '兴奋', icon: '🤗' },
];
