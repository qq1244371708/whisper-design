/**
 * 文件服务 - 与BFF层文件API交互
 */

import { apiClient } from './apiClient';
import type { UploadedFile } from '../types/chat';

export interface FileUploadParams {
  files: File[];
  userId: string;
  onProgress?: (progress: number) => void;
}

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadProgress?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserFilesParams {
  userId: string;
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
}

export interface UserFilesResponse {
  items: FileInfo[];
  total: number;
  page: number;
  limit: number;
}

export interface PreviewOptions {
  width?: number;
  height?: number;
  quality?: number;
}

export class FileService {
  /**
   * 上传文件
   */
  async uploadFiles(params: FileUploadParams): Promise<UploadedFile[]> {
    const { files, userId, onProgress } = params;

    // 将File对象转换为可序列化的格式
    const fileData = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        data: await this.fileToBase64(file),
      }))
    );

    const uploadData = {
      files: fileData,
      userId,
    };

    // 模拟上传进度
    if (onProgress) {
      const progressInterval = setInterval(() => {
        // 这里可以实现真实的上传进度追踪
        onProgress(Math.random() * 100);
      }, 100);

      try {
        const result = await apiClient.post('/api/files/upload', uploadData);
        clearInterval(progressInterval);
        onProgress(100);
        return result;
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    }

    return apiClient.post('/api/files/upload', uploadData);
  }

  /**
   * 获取文件信息
   */
  async getFileById(fileId: string): Promise<FileInfo> {
    return apiClient.get(`/api/files/${fileId}`);
  }

  /**
   * 下载文件
   */
  async downloadFile(fileId: string): Promise<Blob> {
    // 直接使用fetch获取文件流
    const response = await fetch(`${apiClient['baseUrl']}/api/files/download/${fileId}`);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    return response.blob();
  }

  /**
   * 删除文件
   */
  async deleteFile(fileId: string, userId: string): Promise<void> {
    return apiClient.delete(`/api/files/${fileId}?userId=${userId}`);
  }

  /**
   * 获取用户文件列表
   */
  async getUserFiles(params: UserFilesParams): Promise<UserFilesResponse> {
    const { userId, ...queryParams } = params;
    return apiClient.get(`/api/files/user/${userId}`, queryParams);
  }

  /**
   * 生成文件预览URL
   */
  async generatePreview(fileId: string, options: PreviewOptions = {}): Promise<string> {
    const result = await apiClient.post(`/api/files/preview/${fileId}`, options);
    return result.previewUrl;
  }

  /**
   * 将File对象转换为Base64字符串
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // 移除data:mime/type;base64,前缀
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * 检查文件类型是否支持
   */
  isSupportedFileType(file: File): boolean {
    const supportedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
      'text/markdown',
      'application/pdf',
      'application/json',
      'application/javascript',
      'text/css',
      'text/html',
    ];
    return supportedTypes.includes(file.type);
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 获取文件图标
   */
  getFileIcon(fileType: string): string {
    const iconMap: Record<string, string> = {
      'image/': '🖼️',
      'text/': '📄',
      'application/pdf': '📕',
      'application/json': '📋',
      'application/javascript': '📜',
      'text/css': '🎨',
      'text/html': '🌐',
      'audio/': '🎵',
      'video/': '🎬',
    };

    for (const [type, icon] of Object.entries(iconMap)) {
      if (fileType.startsWith(type)) {
        return icon;
      }
    }

    return '📎'; // 默认图标
  }

  /**
   * 检查文件是否为图片
   */
  isImageFile(fileType: string): boolean {
    return fileType.startsWith('image/');
  }

  /**
   * 检查文件是否为文本
   */
  isTextFile(fileType: string): boolean {
    return fileType.startsWith('text/') || 
           fileType === 'application/json' ||
           fileType === 'application/javascript';
  }

  /**
   * 创建文件下载链接
   */
  createDownloadUrl(fileId: string): string {
    return `${apiClient['baseUrl']}/api/files/download/${fileId}`;
  }
}

// 默认文件服务实例
export const fileService = new FileService();

export default FileService;
