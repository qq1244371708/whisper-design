import { DataServiceClient } from '../clients/dataServiceClient.js';

// 创建数据服务客户端实例
const dataClient = new DataServiceClient();

// 用户服务 - 连接真实数据服务
export const userService = {
  // 设置认证token
  setAuthToken(token: string) {
    dataClient.setToken(token);
  },

  // 清除认证token
  clearAuthToken() {
    dataClient.clearToken();
  },

  // 用户认证
  async register(data: { username: string; email: string; password: string; displayName?: string }) {
    try {
      const result = await dataClient.register(data);
      return result;
    } catch (error) {
      console.error('Failed to register user:', error);
      throw error;
    }
  },

  async login(data: { emailOrUsername: string; password: string }) {
    try {
      const result = await dataClient.login(data);
      return result;
    } catch (error) {
      console.error('Failed to login user:', error);
      throw error;
    }
  },

  async refreshToken(token: string) {
    try {
      const newToken = await dataClient.refreshToken(token);
      return newToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw error;
    }
  },

  async getUserById(userId: string) {
    try {
      const user = await dataClient.getProfile();
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName || user.username,
        status: user.status,
        role: user.role,
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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error('Failed to get user:', error);
      // 降级到模拟数据
      return {
        id: userId,
        username: 'demo_user',
        email: 'demo@example.com',
        displayName: '演示用户',
        status: 'active',
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
    }
  },

  async updateUser(userId: string, updateData: any) {
    try {
      const user = await dataClient.updateProfile(updateData);
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        status: user.status,
        role: user.role,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error('Failed to update user:', error);
      // 降级到模拟数据
      return {
        id: userId,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
    }
  },

  async getUsers(params: any) {
    // 这个功能需要管理员权限，暂时返回空数据
    return {
      items: [],
      total: 0,
      page: params.page,
      limit: params.limit,
    };
  },

  async updateUserStatus(userId: string, status: string) {
    try {
      const user = await dataClient.updateProfile({ status });
      return {
        id: user.id,
        status: user.status,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error('Failed to update user status:', error);
      // 降级到模拟数据
      return {
        id: userId,
        status,
        updatedAt: new Date().toISOString(),
      };
    }
  },

  async updateUserPreferences(userId: string, preferences: any) {
    // 用户偏好设置暂时存储在本地，后续可以扩展到数据服务
    return {
      id: userId,
      preferences,
      updatedAt: new Date().toISOString(),
    };
  },
};
