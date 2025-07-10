// [!] 格式化工具函数
import dayjs from 'dayjs';

/**
 * 格式化时间戳为可读时间
 * @param timestamp 时间戳
 * @param format 格式化模板，默认为 'HH:mm'
 * @returns 格式化后的时间字符串
 */
export const formatTime = (timestamp: number, format = 'HH:mm'): string => {
  return dayjs(timestamp).format(format);
};

/**
 * 格式化相对时间
 * @param timestamp 时间戳
 * @returns 相对时间字符串（如：2分钟前）
 */
export const formatRelativeTime = (timestamp: number): string => {
  const now = dayjs();
  const target = dayjs(timestamp);
  const diffInMinutes = now.diff(target, 'minute');

  if (diffInMinutes < 1) return '刚刚';
  if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;

  const diffInHours = now.diff(target, 'hour');
  if (diffInHours < 24) return `${diffInHours}小时前`;

  const diffInDays = now.diff(target, 'day');
  if (diffInDays < 7) return `${diffInDays}天前`;

  return target.format('YYYY-MM-DD');
};

/**
 * 截断文本并添加省略号
 * @param text 原始文本
 * @param maxLength 最大长度
 * @returns 截断后的文本
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
