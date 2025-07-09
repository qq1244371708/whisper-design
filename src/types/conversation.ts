import type { IMessage } from './chat';

export interface IConversation {
  id: string;
  title: string; // Display name for the conversation (e.g., "New Chat", "Chat about React")
  messages: IMessage[]; // Array of messages in this conversation
  lastUpdated: number; // Timestamp of the last message or update
  isPinned?: boolean; // Optional: for pinning important conversations
}
