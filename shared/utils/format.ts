// 格式化工具函数

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export const format = {
  // 时间格式化
  formatTime: (timestamp: string | Date, format = 'YYYY-MM-DD HH:mm:ss'): string => {
    return dayjs(timestamp).format(format);
  },

  // 相对时间
  formatRelativeTime: (timestamp: string | Date): string => {
    return dayjs(timestamp).fromNow();
  },

  // 文件大小格式化
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // 数字格式化（千分位）
  formatNumber: (num: number): string => {
    return num.toLocaleString('zh-CN');
  },

  // 百分比格式化
  formatPercentage: (value: number, decimals = 2): string => {
    return (value * 100).toFixed(decimals) + '%';
  },

  // 货币格式化
  formatCurrency: (amount: number, currency = 'CNY'): string => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  // 手机号格式化（隐藏中间4位）
  formatPhoneNumber: (phone: string): string => {
    if (phone.length !== 11) return phone;
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  },

  // 邮箱格式化（隐藏部分字符）
  formatEmail: (email: string): string => {
    const [username, domain] = email.split('@');
    if (username.length <= 3) return email;
    
    const visibleChars = Math.max(1, Math.floor(username.length / 3));
    const hiddenPart = '*'.repeat(username.length - visibleChars * 2);
    const maskedUsername = username.slice(0, visibleChars) + hiddenPart + username.slice(-visibleChars);
    
    return `${maskedUsername}@${domain}`;
  },

  // 文本截断
  truncateText: (text: string, maxLength: number, suffix = '...'): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - suffix.length) + suffix;
  },

  // 首字母大写
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // 驼峰转下划线
  camelToSnake: (str: string): string => {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  },

  // 下划线转驼峰
  snakeToCamel: (str: string): string => {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  },
};
