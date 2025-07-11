// API相关的共享类型定义

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  code: number;
  message: string;
  details?: any;
}

// HTTP状态码常量
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API路径常量
export const API_PATHS = {
  // 用户相关
  USERS: '/api/users',
  USER_LOGIN: '/api/auth/login',
  USER_REGISTER: '/api/auth/register',
  USER_PROFILE: '/api/users/profile',
  
  // 聊天相关
  CONVERSATIONS: '/api/conversations',
  MESSAGES: '/api/messages',
  
  // 文件相关
  FILE_UPLOAD: '/api/files/upload',
  FILE_DOWNLOAD: '/api/files/download',
} as const;
