import React, { useRef, useEffect } from 'react';
import type { IMessage, IChatConfig } from '../../../types/chat';
import ChatMessage from '../ChatMessage/ChatMessage';
import './ChatMessagesList.scss';

interface ChatMessagesListProps {
  messages: IMessage[];
  config?: IChatConfig;
  isLoadingMore?: boolean; // For future infinite scrolling
}

const ChatMessagesList: React.FC<ChatMessagesListProps> = ({ messages, config, isLoadingMore }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll to bottom when messages change

  return (
    <div className="chat-messages-list">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} config={config} />
      ))}
      {isLoadingMore && <div className="loading-more">Loading more messages...</div>}
      <div ref={messagesEndRef} /> {/* Scroll target */}
    </div>
  );
};

export default ChatMessagesList;
