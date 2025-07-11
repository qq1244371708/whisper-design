// 聊天相关的共享类型定义

export interface IMessage {
  id: string;
  content: string;
  sender: MessageSender;
  timestamp: string;
  type?: MessageType;
  attachments?: UploadedFile[];
  metadata?: MessageMetadata;
}

export interface MessageSender {
  id: string;
  name: string;
  avatar?: string;
  type: 'user' | 'ai' | 'system';
}

export type MessageType = 'text' | 'image' | 'file' | 'system';

export interface MessageMetadata {
  edited?: boolean;
  editedAt?: string;
  replyTo?: string;
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  preview?: string;
  uploadProgress?: number;
  error?: string;
}

export interface IConversation {
  id: string;
  title: string;
  lastMessage?: IMessage;
  lastActivity: string;
  participants: MessageSender[];
  unreadCount?: number;
  isActive?: boolean;
  metadata?: ConversationMetadata;
}

export interface ConversationMetadata {
  tags?: string[];
  priority?: 'low' | 'normal' | 'high';
  archived?: boolean;
  pinned?: boolean;
}

// 聊天状态
export interface ChatState {
  conversations: IConversation[];
  currentConversation?: IConversation;
  messages: IMessage[];
  isLoading: boolean;
  error?: string;
}

// 消息发送参数
export interface SendMessageParams {
  content: string;
  conversationId: string;
  attachments?: UploadedFile[];
  replyTo?: string;
}

// 文件上传参数
export interface FileUploadParams {
  files: File[];
  conversationId?: string;
  maxSize?: number;
  allowedTypes?: string[];
}
