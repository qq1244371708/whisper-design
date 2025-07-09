import React from 'react';
import type { IMessage, IChatConfig } from '../../../types/chat';
import Avatar from '../../base/Avatar/Avatar';
import MessageBubble from '../../base/MessageBubble/MessageBubble';
import './ChatMessage.scss';

interface ChatMessageProps {
  message: IMessage;
  config?: IChatConfig;
}

const ChatMessage: React.FC<ChatMessageProps> = React.memo(({ message, config }) => {
  const isUser = message.sender === 'user';
  const avatarSrc = isUser ? config?.userAvatar : config?.aiAvatar;
  const avatarAlt = isUser ? 'User Avatar' : 'AI Avatar';
  const placement = isUser ? 'end' : 'start'; // For MessageBubble placement

  return (
    <div className={`chat-message chat-message--${placement}`}>
      {placement === 'start' && avatarSrc && (
        <Avatar src={avatarSrc} alt={avatarAlt} size="medium" />
      )}
      <MessageBubble
        id={message.id}
        content={message.content}
        placement={placement}
        isLoading={message.isLoading}
        // Pass other props from IMessage to MessageBubble if needed
      />
      {placement === 'end' && avatarSrc && (
        <Avatar src={avatarSrc} alt={avatarAlt} size="medium" />
      )}
    </div>
  );
}); // Wrapped with React.memo

export default ChatMessage;
