// 用户相关的共享类型定义

export interface IUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  status: UserStatus;
  role: UserRole;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export type UserStatus = 'online' | 'offline' | 'away' | 'busy';

export type UserRole = 'admin' | 'user' | 'guest';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sound: boolean;
  mentions: boolean;
  newMessages: boolean;
}

export interface PrivacySettings {
  showOnlineStatus: boolean;
  allowDirectMessages: boolean;
  showReadReceipts: boolean;
}

// 认证相关
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface AuthState {
  user?: IUser;
  token?: AuthToken;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}

// 用户操作
export interface UpdateUserParams {
  displayName?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}

export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
