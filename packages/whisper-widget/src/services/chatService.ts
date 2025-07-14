/**
 * 聊天服务 - 与BFF层聊天API交互
 */

import { apiClient } from './apiClient';
import type { IMessage, SendMessageParams } from '../types/chat';
import type { IConversation } from '../types/conversation';

export interface ConversationListParams {
  userId: string;
  page?: number;
  limit?: number;
}

export interface ConversationListResponse {
  items: IConversation[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateConversationParams {
  title: string;
  userId: string;
}

export interface GetMessagesParams {
  conversationId: string;
  page?: number;
  limit?: number;
  before?: string;
  after?: string;
}

export interface MessagesResponse {
  items: IMessage[];
  total: number;
  page: number;
  limit: number;
}

export class ChatService {
  /**
   * 获取对话列表
   */
  async getConversations(params: ConversationListParams): Promise<ConversationListResponse> {
    return apiClient.get('/api/chat/conversations', params);
  }

  /**
   * 创建新对话
   */
  async createConversation(params: CreateConversationParams): Promise<IConversation> {
    return apiClient.post('/api/chat/conversations', params);
  }

  /**
   * 获取对话详情和消息
   */
  async getConversationWithMessages(conversationId: string, page = 1, limit = 50): Promise<IConversation> {
    return apiClient.get(`/api/chat/conversations/${conversationId}`, { page, limit });
  }

  /**
   * 发送消息
   */
  async sendMessage(conversationId: string, params: SendMessageParams): Promise<IMessage> {
    return apiClient.post(`/api/chat/conversations/${conversationId}/messages`, params);
  }

  /**
   * 获取消息列表
   */
  async getMessages(params: GetMessagesParams): Promise<MessagesResponse> {
    const { conversationId, ...queryParams } = params;
    return apiClient.get(`/api/chat/conversations/${conversationId}/messages`, queryParams);
  }

  /**
   * 删除对话
   */
  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    return apiClient.delete(`/api/chat/conversations/${conversationId}?userId=${userId}`);
  }

  /**
   * 发送AI聊天请求
   */
  async sendAIMessage(messages: Array<{ role: string; content: string }>, options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<{
    id: string;
    content: string;
    model: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }> {
    return apiClient.post('/api/proxy/ai/chat', {
      messages,
      model: options?.model || 'gpt-3.5-turbo',
      temperature: options?.temperature || 0.7,
      maxTokens: options?.maxTokens || 1000,
    });
  }

  /**
   * 批量操作 - 聚合多个请求
   */
  async aggregateData(requests: Array<{
    url: string;
    method: string;
    query?: Record<string, any>;
    body?: any;
  }>): Promise<{
    results: Array<{
      id: number;
      request: any;
      response: any;
    }>;
    timestamp: string;
  }> {
    return apiClient.post('/api/proxy/aggregate', { requests });
  }
}

// 默认聊天服务实例
export const chatService = new ChatService();

export default ChatService;
