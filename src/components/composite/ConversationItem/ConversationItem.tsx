import React from 'react';
import type { IConversation } from '../../../types/conversation';
import './ConversationItem.scss';
import dayjs from 'dayjs';

interface ConversationItemProps {
  conversation: IConversation;
  isActive: boolean;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  // onEditTitle: (id: string, newTitle: string) => void; // Removed for now
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
  onDelete,
  // onEditTitle, // Removed for now
}) => {
  const lastMessageSnippet = conversation.messages.length > 0
    ? conversation.messages[conversation.messages.length - 1].content.substring(0, 50) + '...'
    : 'No messages yet.';

  const formattedLastUpdated = dayjs(conversation.lastUpdated).format('HH:mm');

  return (
    <div
      className={`conversation-item ${isActive ? 'conversation-item--active' : ''}`}
      onClick={() => onClick(conversation.id)}
    >
      <div className="conversation-item__info">
        <div className="conversation-item__title">{conversation.title}</div>
        <div className="conversation-item__snippet">{lastMessageSnippet}</div>
      </div>
      <div className="conversation-item__meta">
        <span className="conversation-item__time">{formattedLastUpdated}</span>
        {/* Add delete button */}
        <button className="conversation-item__delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(conversation.id); }}>&times;</button>
      </div>
    </div>
  );
};

export default ConversationItem;
