import { DataServiceClient } from '../clients/dataServiceClient.js';

// 创建数据服务客户端实例
const dataClient = new DataServiceClient();

// 聊天服务 - 连接真实数据服务
export const chatService = {
  // 设置认证token
  setAuthToken(token: string) {
    dataClient.setToken(token);
  },

  // 清除认证token
  clearAuthToken() {
    dataClient.clearToken();
  },

  async getConversations(params: { userId: string; page: number; limit: number }) {
    try {
      const result = await dataClient.getConversations({
        page: params.page,
        limit: params.limit,
      });

      // 转换数据格式以匹配现有API
      return {
        items: result.conversations.map(conv => ({
          id: conv.id,
          title: conv.title,
          lastUpdated: new Date(conv.updatedAt).getTime(),
          messages: [], // 消息将通过单独的API获取
        })),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error) {
      console.error('Failed to get conversations:', error);
      // 降级到模拟数据
      return {
        items: [],
        total: 0,
        page: params.page,
        limit: params.limit,
      };
    }
  },

  async createConversation(params: { title: string; userId: string }) {
    try {
      const conversation = await dataClient.createConversation({
        title: params.title,
        type: 'chat',
      });

      return {
        id: conversation.id,
        title: conversation.title,
        lastUpdated: new Date(conversation.updatedAt).getTime(),
        messages: [],
      };
    } catch (error) {
      console.error('Failed to create conversation:', error);
      // 降级到模拟数据
      return {
        id: `conv-${Date.now()}`,
        title: params.title,
        lastUpdated: Date.now(),
        messages: [],
      };
    }
  },

  async getConversationWithMessages(params: { conversationId: string; page: number; limit: number }) {
    try {
      const [conversation, messagesResult] = await Promise.all([
        dataClient.getConversation(params.conversationId),
        dataClient.getMessages(params.conversationId, {
          page: params.page,
          limit: params.limit,
        }),
      ]);

      return {
        id: conversation.id,
        title: conversation.title,
        messages: messagesResult.messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.senderType,
          timestamp: new Date(msg.createdAt).getTime(),
          files: msg.files || [],
          type: msg.type,
        })),
        lastUpdated: new Date(conversation.updatedAt).getTime(),
      };
    } catch (error) {
      console.error('Failed to get conversation with messages:', error);
      // 降级到模拟数据
      return {
        id: params.conversationId,
        title: 'AI助手对话',
        messages: [],
        lastUpdated: Date.now(),
      };
    }
  },

  async sendMessage(params: any) {
    try {
      const message = await dataClient.sendMessage(params.conversationId, {
        content: params.content || '',
        type: params.type || 'text',
        files: params.files || [],
      });

      return {
        id: message.id,
        content: message.content,
        sender: message.senderType,
        timestamp: new Date(message.createdAt).getTime(),
        files: message.files || [],
        type: message.type,
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      // 降级到模拟数据
      return {
        id: `msg-${Date.now()}`,
        content: params.content || '',
        sender: params.sender || 'user',
        timestamp: Date.now(),
        files: params.files || [],
        type: params.type || 'text',
      };
    }
  },

  async getMessages(params: any) {
    try {
      const result = await dataClient.getMessages(params.conversationId, {
        page: params.page,
        limit: params.limit,
      });

      return {
        items: result.messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.senderType,
          timestamp: new Date(msg.createdAt).getTime(),
          files: msg.files || [],
          type: msg.type,
        })),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error) {
      console.error('Failed to get messages:', error);
      // 降级到模拟数据
      return {
        items: [],
        total: 0,
        page: params.page,
        limit: params.limit,
      };
    }
  },

  async deleteConversation(params: { conversationId: string; userId: string }) {
    try {
      await dataClient.deleteConversation(params.conversationId);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      return { success: false };
    }
  },
};
