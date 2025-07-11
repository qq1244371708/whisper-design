// 数据验证工具函数

export const validation = {
  // 邮箱验证
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // 密码强度验证
  isValidPassword: (password: string): boolean => {
    // 至少8位，包含大小写字母和数字
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  // 用户名验证
  isValidUsername: (username: string): boolean => {
    // 3-20位，只能包含字母、数字、下划线
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  },

  // 文件类型验证
  isValidFileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });
  },

  // 文件大小验证
  isValidFileSize: (file: File, maxSizeInMB: number): boolean => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  },

  // URL验证
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // 手机号验证（中国大陆）
  isValidPhoneNumber: (phone: string): boolean => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  },

  // 非空字符串验证
  isNonEmptyString: (str: string): boolean => {
    return typeof str === 'string' && str.trim().length > 0;
  },

  // 数字范围验证
  isInRange: (num: number, min: number, max: number): boolean => {
    return num >= min && num <= max;
  },

  // 数组非空验证
  isNonEmptyArray: <T>(arr: T[]): boolean => {
    return Array.isArray(arr) && arr.length > 0;
  },
};

// 验证错误消息
export const validationMessages = {
  email: '请输入有效的邮箱地址',
  password: '密码至少8位，包含大小写字母和数字',
  username: '用户名3-20位，只能包含字母、数字、下划线',
  required: '此字段为必填项',
  fileType: '不支持的文件类型',
  fileSize: '文件大小超出限制',
  url: '请输入有效的URL地址',
  phoneNumber: '请输入有效的手机号码',
  range: '数值超出有效范围',
} as const;
