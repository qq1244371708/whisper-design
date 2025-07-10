import React from 'react';
import type { IConversation } from '../../../types/conversation';
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
  // Use first message as title, fallback to original title
  const conversationTitle = conversation.messages.length > 0
    ? conversation.messages[0].content.substring(0, 30) + (conversation.messages[0].content.length > 30 ? '...' : '')
    : conversation.title;

  const lastMessageSnippet = conversation.messages.length > 0
    ? conversation.messages[conversation.messages.length - 1].content.substring(0, 50) + '...'
    : 'No messages yet.';

  const formattedLastUpdated = dayjs(conversation.lastUpdated).format('HH:mm');

  return (
    <div
      className={`conversation-item ${isActive ? 'active' : ''}`}
      onClick={() => onClick(conversation.id)}
    >
      <div className="conversation-info">
        <div className="conversation-title">
          <span>{conversationTitle}</span>
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