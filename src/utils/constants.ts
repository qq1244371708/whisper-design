// [!] 常量定义

/**
 * 文件上传限制
 */
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 5,
  ACCEPTED_TYPES: 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md',
} as const;

/**
 * 消息相关常量
 */
export const MESSAGE = {
  MAX_LENGTH: 2000,
  TYPING_DELAY: 1000, // 模拟AI输入延迟
} as const;

/**
 * UI相关常量
 */
export const UI = {
  CONVERSATION_TITLE_MAX_LENGTH: 30,
  MESSAGE_PREVIEW_MAX_LENGTH: 50,
  ANIMATION_DURATION: 300,
} as const;

/**
 * 主题相关常量
 */
export const THEME = {
  COLORS: {
    PRIMARY: '#4D8EFF',
    SECONDARY: '#00F0FF',
    SUCCESS: '#28D193',
    ERROR: '#FF4D7A',
    WARNING: '#FFC84D',
  },
  BREAKPOINTS: {
    MOBILE: '768px',
    TABLET: '1024px',
    DESKTOP: '1200px',
  },
} as const;
