// 菜单配置管理
import { BusinessMode } from '@/types';

const MENU_CONFIG_KEY = 'menu_config';

// 默认菜单配置（账单记录、睡眠记录、日常记录、学习记录，软件使用放最后）
const DEFAULT_MENU_CONFIG: BusinessMode[] = [
  BusinessMode.ACCOUNTING,
  BusinessMode.SLEEP,
  BusinessMode.DAILY,
  BusinessMode.STUDY
];

/**
 * 加载菜单配置
 */
export const loadMenuConfig = (): BusinessMode[] => {
  try {
    const stored = localStorage.getItem(MENU_CONFIG_KEY);
    if (stored) {
      const config = JSON.parse(stored);
      // 验证配置是否有效
      if (Array.isArray(config) && config.every(item => Object.values(BusinessMode).includes(item))) {
        return config;
      }
    }
  } catch (error) {
    console.error('加载菜单配置失败:', error);
  }
  return DEFAULT_MENU_CONFIG;
};

/**
 * 保存菜单配置
 */
export const saveMenuConfig = (config: BusinessMode[]): void => {
  try {
    localStorage.setItem(MENU_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('保存菜单配置失败:', error);
  }
};

/**
 * 重置为默认菜单配置
 */
export const resetMenuConfig = (): BusinessMode[] => {
  saveMenuConfig(DEFAULT_MENU_CONFIG);
  return DEFAULT_MENU_CONFIG;
};

/**
 * 检查某个菜单是否启用
 */
export const isMenuEnabled = (mode: BusinessMode): boolean => {
  const config = loadMenuConfig();
  return config.includes(mode);
};

/**
 * 切换菜单启用状态
 */
export const toggleMenu = (mode: BusinessMode): BusinessMode[] => {
  const config = loadMenuConfig();
  const index = config.indexOf(mode);
  
  if (index > -1) {
    // 如果已存在，则移除
    config.splice(index, 1);
  } else {
    // 如果不存在，则添加
    config.push(mode);
  }
  
  saveMenuConfig(config);
  return config;
};

/**
 * 获取所有可用的菜单选项
 */
export const getAllMenuOptions = (): BusinessMode[] => {
  return Object.values(BusinessMode);
};
