// [!] 文件处理工具函数

/**
 * 获取文件图标类名
 * @param fileName 文件名
 * @returns FontAwesome图标类名
 */
export const getFileIcon = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf':
      return 'fas fa-file-pdf';
    case 'xlsx':
    case 'xls':
      return 'fas fa-file-excel';
    case 'docx':
    case 'doc':
      return 'fas fa-file-word';
    case 'pptx':
    case 'ppt':
      return 'fas fa-file-powerpoint';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'svg':
    case 'webp':
      return 'fas fa-file-image';
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'flv':
      return 'fas fa-file-video';
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
      return 'fas fa-file-audio';
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return 'fas fa-file-archive';
    case 'txt':
    case 'md':
      return 'fas fa-file-alt';
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'html':
    case 'css':
    case 'scss':
    case 'json':
    case 'xml':
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
      return 'fas fa-file-code';
    default:
      return 'fas fa-file';
  }
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * 验证文件类型
 * @param file 文件对象
 * @param acceptedTypes 接受的文件类型
 * @returns 是否为有效文件类型
 */
export const validateFileType = (file: File, acceptedTypes: string): boolean => {
  if (!acceptedTypes) return true;

  const types = acceptedTypes.split(',').map(type => type.trim());
  return types.some(type => {
    if (type.startsWith('.')) {
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    }
    return file.type.match(type);
  });
};
