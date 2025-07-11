// 统一导出所有共享类型

// API相关类型
export * from './api';

// 聊天相关类型
export * from './chat';

// 用户相关类型
export * from './user';

// 通用工具类型
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type ValueOf<T> = T[keyof T];
