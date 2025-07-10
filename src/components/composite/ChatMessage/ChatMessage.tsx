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
  const avatarGradient = isUser ? 'primary' : 'secondary';

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message-row ${isUser ? 'user' : ''}`}>
      <Avatar
        {...(avatarSrc && { src: avatarSrc })}
        alt={avatarAlt}
        size="medium"
        gradient={avatarGradient}
      >
        {/* Render icon if no src provided */}
        {!avatarSrc && <i className={`fas fa-${isUser ? 'user' : 'robot'}`}></i>}
      </Avatar>
      <div className="message-content">
        <MessageBubble
          id={message.id}
          content={message.content}
          sender={message.sender}
          type={message.type || 'text'}
          {...(message.isLoading !== undefined && { isLoading: message.isLoading })}
          {...(message.files && { files: message.files })}
        />
        <div className="message-time">{formatTime(message.timestamp)}</div>
      </div>
    </div>
  );
});

export default ChatMessage;
