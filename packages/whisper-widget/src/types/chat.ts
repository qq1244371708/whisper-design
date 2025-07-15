import type { UploadedFile } from '../components/base/FileUpload/interfaces';

// 重新导出UploadedFile类型
export type { UploadedFile };

export interface IMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string; // 可以是文本、图片URL等
  timestamp: number; // 时间戳
  type?: 'text' | 'image' | 'code' | 'file'; // 消息类型
  isLoading?: boolean; // AI消息是否正在生成中
  isError?: boolean; // 是否为错误消息
  files?: UploadedFile[]; // Optional file attachments
}

export interface IChatConfig {
  theme?: 'light' | 'dark';
  userAvatar?: string;
  aiAvatar?: string;
  aiModel?: string; // AI模型名称
}

export interface SendMessageParams {
  content?: string; // 可选，因为可能只发送文件
  files?: UploadedFile[];
  sender?: 'user' | 'ai'; // 发送者类型
  type?: 'text' | 'image' | 'code' | 'file' | 'ai'; // 消息类型
}

export interface IUser {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  role?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    language?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      sound?: boolean;
      mentions?: boolean;
      newMessages?: boolean;
    };
    privacy?: {
      showOnlineStatus?: boolean;
      allowDirectMessages?: boolean;
      showReadReceipts?: boolean;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

// 统一管理枚举值
export type MessageSender = 'user' | 'ai';

export type MessageType = 'text' | 'image' | 'code' | 'file';

export type ChatTheme = 'light' | 'dark';
