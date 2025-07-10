import React from 'react';
import type { IConversation } from '../../../types/conversation';
import { formatTime, truncateText } from '../../../utils/format';
import { UI } from '../../../utils/constants';
import './ConversationItem.scss';

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
  const conversationTitle =
    conversation.messages.length > 0 && conversation.messages[0]
      ? truncateText(conversation.messages[0].content, UI.CONVERSATION_TITLE_MAX_LENGTH)
      : conversation.title;

  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const lastMessageSnippet =
    conversation.messages.length > 0 && lastMessage
      ? truncateText(lastMessage.content, UI.MESSAGE_PREVIEW_MAX_LENGTH)
      : 'No messages yet.';

  const formattedLastUpdated = formatTime(conversation.lastUpdated);

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
        <div className="conversation-preview">{lastMessageSnippet}</div>
      </div>
      {/* Conditionally render badge if needed, e.g., for unread messages */}
      {/* <div className="conversation-badge"></div> */}
    </div>
  );
};

export default ConversationItem;
