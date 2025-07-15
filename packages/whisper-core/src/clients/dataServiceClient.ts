import axios, { AxiosInstance, AxiosResponse } from 'axios';

// 数据服务API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

// 用户相关类型
export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginData {
  emailOrUsername: string;
  password: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

// 对话相关类型
export interface Conversation {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  messageCount: number;
  lastMessageAt?: string;
  pinned: boolean;
  starred: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// 消息相关类型
export interface Message {
  id: string;
  content: string;
  type: string;
  senderType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  conversationId: string;
  files?: FileInfo[];
}

// 文件相关类型
export interface FileInfo {
  id: string;
  originalName: string;
  filename: string;
  path: string;
  url?: string;
  mimeType: string;
  type: string;
  size: number;
  status: string;
  createdAt: string;
  userId: string;
}

export class DataServiceClient {
  private client: AxiosInstance;
  private token?: string;

  constructor(baseURL: string = 'http://localhost:3002') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器 - 添加认证token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // 响应拦截器 - 处理错误
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Data service API error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // 设置认证token
  setToken(token: string) {
    this.token = token;
  }

  // 清除认证token
  clearToken() {
    this.token = undefined;
  }

  // 健康检查
  async healthCheck(): Promise<any> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // 用户认证相关
  async register(data: RegisterData): Promise<AuthResult> {
    const response: AxiosResponse<ApiResponse<AuthResult>> = await this.client.post('/api/users/register', data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Registration failed');
    }
    return response.data.data!;
  }

  async login(data: LoginData): Promise<AuthResult> {
    const response: AxiosResponse<ApiResponse<AuthResult>> = await this.client.post('/api/users/login', data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Login failed');
    }
    return response.data.data!;
  }

  async getProfile(): Promise<User> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await this.client.get('/api/users/profile');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get profile');
    }
    return response.data.data!.user;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await this.client.put('/api/users/profile', data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update profile');
    }
    return response.data.data!.user;
  }

  async refreshToken(token: string): Promise<string> {
    const response: AxiosResponse<ApiResponse<{ token: string }>> = await this.client.post('/api/users/refresh-token', { token });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to refresh token');
    }
    return response.data.data!.token;
  }

  // 对话相关
  async getConversations(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    conversations: Conversation[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await this.client.get('/api/conversations', { params });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get conversations');
    }
    return response.data.data;
  }

  async createConversation(data: {
    title: string;
    description?: string;
    type?: string;
  }): Promise<Conversation> {
    const response: AxiosResponse<ApiResponse<Conversation>> = await this.client.post('/api/conversations', data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create conversation');
    }
    return response.data.data!;
  }

  async getConversation(id: string): Promise<Conversation> {
    const response: AxiosResponse<ApiResponse<Conversation>> = await this.client.get(`/api/conversations/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get conversation');
    }
    return response.data.data!;
  }

  async updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation> {
    const response: AxiosResponse<ApiResponse<Conversation>> = await this.client.put(`/api/conversations/${id}`, data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update conversation');
    }
    return response.data.data!;
  }

  async deleteConversation(id: string): Promise<void> {
    const response: AxiosResponse<ApiResponse> = await this.client.delete(`/api/conversations/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete conversation');
    }
  }

  // 消息相关
  async getMessages(conversationId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    messages: Message[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await this.client.get(`/api/conversations/${conversationId}/messages`, { params });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get messages');
    }
    return response.data.data;
  }

  async sendMessage(conversationId: string, data: {
    content: string;
    type?: string;
    files?: string[];
  }): Promise<Message> {
    const response: AxiosResponse<ApiResponse<Message>> = await this.client.post(`/api/conversations/${conversationId}/messages`, data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to send message');
    }
    return response.data.data!;
  }

  // 文件相关
  async uploadFile(file: File): Promise<FileInfo> {
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse<ApiResponse<FileInfo>> = await this.client.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to upload file');
    }
    return response.data.data!;
  }

  async getFile(id: string): Promise<FileInfo> {
    const response: AxiosResponse<ApiResponse<FileInfo>> = await this.client.get(`/api/files/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get file');
    }
    return response.data.data!;
  }
}
