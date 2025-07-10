import React from "react";
import { MessageSender, MessageType } from "../../../types/chat";

export type ContentType = string | React.ReactNode;

export interface MessageBubbleProps {
  id: string | number;
  content: ContentType;
  sender: MessageSender; // 'user' or 'ai'
  type?: MessageType; // 'text', 'image', 'code'
  isLoading?: boolean; // AI message is generating
}