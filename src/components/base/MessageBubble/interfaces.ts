import React from "react";

export type ContentType = string | React.ReactNode;

export interface MessageBubbleProps {
  id: string | number;
  /** 展示头像 */
  avatar?: React.ReactNode;
  /** 聊天内容 */
  content: ContentType;
  /** 底部内容 */
  footer?:
    | React.ReactNode
    | ((
        content: ContentType,
        info: { key: string | number }
      ) => React.ReactNode);
  /** 头部内容 */
  header?:
    | React.ReactNode
    | ((
        content: ContentType,
        info: { key: string | number }
      ) => React.ReactNode);
  /** 自定义类名 */
  className?: string;
  /** 信息位置 */
  placement?: 'start' | 'end';
  /** 是否正在加载 */
  isLoading?: boolean;
}
