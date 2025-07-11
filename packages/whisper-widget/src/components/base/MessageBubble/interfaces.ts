import React from 'react';
import type { MessageSender, MessageType } from '../../../types/chat';
import type { UploadedFile } from '../FileUpload/interfaces';

export type ContentType = string | React.ReactNode;

export interface MessageBubbleProps {
  id: string | number;
  content: ContentType;
  sender: MessageSender; // 'user' or 'ai'
  type?: MessageType; // 'text', 'image', 'code'
  isLoading?: boolean; // AI message is generating
  files?: UploadedFile[]; // Optional file attachments
}
