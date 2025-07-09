export interface IMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string; // 可以是文本、图片URL等
  timestamp: number; // 时间戳
  type?: 'text' | 'image' | 'code'; // 消息类型
  isLoading?: boolean; // AI消息是否正在生成中
}

export interface IChatConfig {
  theme?: 'light' | 'dark';
  userAvatar?: string;
  aiAvatar?: string;
}

// 统一管理枚举值
export type MessageSender = 'user' | 'ai';

export type MessageType = 'text' | 'image' | 'code';

export type ChatTheme = 'light' | 'dark';
