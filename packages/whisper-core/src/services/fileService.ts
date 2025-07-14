// 文件服务 - 模拟实现
export const fileService = {
  async uploadFiles(params: any) {
    return params.files.map((file: any, index: number) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: `http://localhost:3001/files/download/file-${Date.now()}-${index}`,
      uploadProgress: 100,
    }));
  },

  async getFileById(fileId: string) {
    return {
      id: fileId,
      name: 'example.txt',
      size: 1024,
      type: 'text/plain',
      url: `http://localhost:3001/files/download/${fileId}`,
    };
  },

  async downloadFile(fileId: string) {
    // 模拟文件流
    return null; // 实际实现中返回文件流
  },

  async deleteFile(fileId: string, userId: string) {
    return { success: true };
  },

  async getUserFiles(params: any) {
    return {
      items: [],
      total: 0,
      page: params.page,
      limit: params.limit,
    };
  },

  async generatePreview(fileId: string, options: any) {
    return `http://localhost:3001/files/preview/${fileId}`;
  },
};
