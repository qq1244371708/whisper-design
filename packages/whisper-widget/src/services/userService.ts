/**
 * 用户服务 - 与BFF层用户API交互
 */

import { apiClient } from './apiClient';
import type { IUser } from '../types/chat';

export interface UpdateUserParams {
  displayName?: string;
  email?: string;
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
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export interface UserListResponse {
  items: IUser[];
  total: number;
  page: number;
  limit: number;
}

export type UserStatus = 'online' | 'offline' | 'away' | 'busy';

export class UserService {
  /**
   * 获取用户信息
   */
  async getUserById(userId: string): Promise<IUser> {
    return apiClient.get(`/api/users/profile/${userId}`);
  }

  /**
   * 更新用户信息
   */
  async updateUser(userId: string, params: UpdateUserParams): Promise<IUser> {
    return apiClient.put(`/api/users/profile/${userId}`, params);
  }

  /**
   * 获取用户列表（管理员功能）
   */
  async getUsers(params: UserListParams = {}): Promise<UserListResponse> {
    return apiClient.get('/api/users', params);
  }

  /**
   * 更新用户状态
   */
  async updateUserStatus(userId: string, status: UserStatus): Promise<IUser> {
    return apiClient.patch(`/api/users/status/${userId}`, { status });
  }

  /**
   * 更新用户偏好设置
   */
  async updateUserPreferences(userId: string, preferences: UpdateUserParams['preferences']): Promise<IUser> {
    return apiClient.put(`/api/users/preferences/${userId}`, preferences);
  }

  /**
   * 获取当前用户信息（基于认证令牌）
   */
  async getCurrentUser(): Promise<IUser> {
    // 这里可以从localStorage或其他地方获取当前用户ID
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('No current user found');
    }
    return this.getUserById(currentUserId);
  }

  /**
   * 设置当前用户ID
   */
  setCurrentUserId(userId: string): void {
    localStorage.setItem('whisper_current_user_id', userId);
  }

  /**
   * 获取当前用户ID
   */
  getCurrentUserId(): string | null {
    return localStorage.getItem('whisper_current_user_id');
  }

  /**
   * 清除当前用户信息
   */
  clearCurrentUser(): void {
    localStorage.removeItem('whisper_current_user_id');
  }

  /**
   * 检查用户是否在线
   */
  isUserOnline(user: IUser): boolean {
    return user.status === 'online';
  }

  /**
   * 获取用户显示名称
   */
  getUserDisplayName(user: IUser): string {
    return user.displayName || user.username || user.email || 'Unknown User';
  }

  /**
   * 获取用户头像URL
   */
  getUserAvatarUrl(user: IUser): string {
    // 如果用户有自定义头像，返回自定义头像
    if (user.avatar) {
      return user.avatar;
    }

    // 否则生成默认头像
    const displayName = this.getUserDisplayName(user);
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;
  }

  /**
   * 格式化用户状态文本
   */
  formatUserStatus(status: UserStatus): string {
    const statusMap: Record<UserStatus, string> = {
      online: '在线',
      offline: '离线',
      away: '离开',
      busy: '忙碌',
    };
    return statusMap[status] || '未知';
  }

  /**
   * 获取用户状态颜色
   */
  getUserStatusColor(status: UserStatus): string {
    const colorMap: Record<UserStatus, string> = {
      online: '#52c41a',
      offline: '#d9d9d9',
      away: '#faad14',
      busy: '#ff4d4f',
    };
    return colorMap[status] || '#d9d9d9';
  }
}

// 默认用户服务实例
export const userService = new UserService();

export default UserService;
