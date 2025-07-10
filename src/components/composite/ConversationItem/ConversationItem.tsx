import React from 'react';
import type { IConversation } from '../../../types/conversation';
import Avatar from '../../base/Avatar/Avatar';
import './ConversationItem.scss';
import dayjs from 'dayjs';

interface ConversationItemProps {
  conversation: IConversation;
  isActive: boolean;
  onClick: (id: string) => void;
  // onDelete: (id: string) => void; // Removed
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
  // onDelete, // Removed
}) => {
  const lastMessageSnippet = conversation.messages.length > 0
    ? conversation.messages[conversation.messages.length - 1].content.substring(0, 50) + '...'
    : 'No messages yet.';

  const formattedLastUpdated = dayjs(conversation.lastUpdated).format('HH:mm');

  return (
    <div
      className={`conversation-item ${isActive ? 'active' : ''}`}
      onClick={() => onClick(conversation.id)}
    >
      <Avatar size="medium" gradient="primary">
        <i className="fas fa-robot"></i>
      </Avatar>
      <div className="conversation-info">
        <div className="conversation-title">
          <span>{conversation.title}</span>
          <span className="conversation-time">{formattedLastUpdated}</span>
        </div>
        <div className="conversation-preview">
          {lastMessageSnippet}
        </div>
      </div>
      {/* Conditionally render badge if needed, e.g., for unread messages */}
      {/* <div className="conversation-badge"></div> */}
    </div>
  );
};

export default ConversationItem;