// 聊天服务 - 模拟实现，Phase 3 将连接真实数据库
export const chatService = {
  async getConversations(params: { userId: string; page: number; limit: number }) {
    // 模拟数据
    return {
      items: [
        {
          id: 'conv-1',
          title: 'AI助手对话',
          lastUpdated: Date.now(),
          messages: [],
        },
      ],
      total: 1,
      page: params.page,
      limit: params.limit,
    };
  },

  async createConversation(params: { title: string; userId: string }) {
    return {
      id: `conv-${Date.now()}`,
      title: params.title,
      lastUpdated: Date.now(),
      messages: [],
    };
  },

  async getConversationWithMessages(params: { conversationId: string; page: number; limit: number }) {
    return {
      id: params.conversationId,
      title: 'AI助手对话',
      messages: [],
      lastUpdated: Date.now(),
    };
  },

  async sendMessage(params: any) {
    return {
      id: `msg-${Date.now()}`,
      content: params.content || '',
      sender: params.sender || 'user',
      timestamp: Date.now(),
      files: params.files || [],
      type: params.type || 'text',
    };
  },

  async getMessages(params: any) {
    return {
      items: [],
      total: 0,
      page: params.page,
      limit: params.limit,
    };
  },

  async deleteConversation(params: { conversationId: string; userId: string }) {
    return { success: true };
  },
};
