export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatCurrency = (amount: number): string => {
  return `¥${amount.toFixed(2)}`;
};

export const parseDate = (dateString: string): Date => {
  return new Date(dateString);
};

export const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // 格式化为 "10月19日"
  const monthDay = date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric'
  });
  
  if (formatDate(date) === formatDate(today)) {
    return `${monthDay} 今天`;
  } else if (formatDate(date) === formatDate(yesterday)) {
    return `${monthDay} 昨天`;
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  }
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};