// 用户服务 - 模拟实现
export const userService = {
  async getUserById(userId: string) {
    return {
      id: userId,
      username: 'demo_user',
      email: 'demo@example.com',
      displayName: '演示用户',
      status: 'online',
      role: 'user',
      preferences: {
        theme: 'light',
        language: 'zh-CN',
        notifications: {
          email: true,
          push: true,
          sound: true,
          mentions: true,
          newMessages: true,
        },
        privacy: {
          showOnlineStatus: true,
          allowDirectMessages: true,
          showReadReceipts: true,
        },
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    };
  },

  async updateUser(userId: string, updateData: any) {
    return {
      id: userId,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
  },

  async getUsers(params: any) {
    return {
      items: [],
      total: 0,
      page: params.page,
      limit: params.limit,
    };
  },

  async updateUserStatus(userId: string, status: string) {
    return {
      id: userId,
      status,
      updatedAt: new Date().toISOString(),
    };
  },

  async updateUserPreferences(userId: string, preferences: any) {
    return {
      id: userId,
      preferences,
      updatedAt: new Date().toISOString(),
    };
  },
};
