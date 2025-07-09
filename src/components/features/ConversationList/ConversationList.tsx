import React, { useState, useMemo } from 'react';
import type { IConversation } from '../../../types/conversation';
import ConversationItem from '../../composite/ConversationItem/ConversationItem';
import './ConversationList.scss';
// Removed uuid and dayjs as they are not directly used here

interface ConversationListProps {
  conversations: IConversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  // onUpdateConversationTitle: (id: string, newTitle: string) => void; // Removed
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  // onUpdateConversationTitle, // Removed
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = useMemo(() => {
    if (!searchQuery) {
      return conversations;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return conversations.filter(conv =>
      conv.title.toLowerCase().includes(lowerCaseQuery) ||
      conv.messages.some(msg => msg.content.toLowerCase().includes(lowerCaseQuery))
    );
  }, [conversations, searchQuery]);

  return (
    <div className="conversation-list-container">
      <div className="conversation-list__header">
        <input
          type="text"
          placeholder="Search conversations..."
          className="conversation-list__search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="conversation-list__new-btn" onClick={onNewConversation}>
          + New Chat
        </button>
      </div>
      <div className="conversation-list__items">
        {filteredConversations.length > 0 ? (
          filteredConversations.map(conv => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeConversationId}
              onClick={onSelectConversation}
              onDelete={onDeleteConversation}
              // Removed onEditTitle as it's not implemented in ConversationItem
            />
          ))
        ) : (
          <div className="conversation-list__empty">No conversations found.</div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
