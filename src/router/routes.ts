/**
 * 路由配置
 */

export interface RouteConfig {
  path: string;
  name: string;
  component?: string;
  description?: string;
}

/**
 * 应用路由表
 */
export const routes: RouteConfig[] = [
  {
    path: '/',
    name: 'home',
    component: 'Home',
    description: '首页 - 记账记录'
  },
  {
    path: '/records',
    name: 'records',
    component: 'Records',
    description: '数据面板 - 统计图表'
  },
  {
    path: '/sleep-records',
    name: 'sleepRecords',
    component: 'SleepRecords',
    description: '睡眠记录 - 睡眠数据面板'
  },
  {
    path: '/daily-records',
    name: 'dailyRecords',
    component: 'DailyRecords',
    description: '日常记录 - 日常数据面板'
  },
  {
    path: '/study-records',
    name: 'studyRecords',
    component: 'StudyRecords',
    description: '学习记录 - 学习数据面板'
  }
];

/**
 * 获取当前路由路径（不包含查询参数）
 */
export const getCurrentPath = (): string => {
  const hash = window.location.hash.slice(1) || '/';
  // 移除查询参数
  return hash.split('?')[0];
};

/**
 * 导航到指定路由
 */
export const navigateTo = (path: string): void => {
  window.location.hash = path;
};

/**
 * 根据路径查找路由配置
 */
export const findRouteByPath = (path: string): RouteConfig | undefined => {
  return routes.find(route => route.path === path);
};

/**
 * 根据名称查找路由配置
 */
export const findRouteByName = (name: string): RouteConfig | undefined => {
  return routes.find(route => route.name === name);
};
