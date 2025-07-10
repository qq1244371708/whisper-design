import React, { useState, useMemo } from 'react';
import type { IConversation } from '../../../types/conversation';
import ConversationItem from '../../composite/ConversationItem/ConversationItem';
import './ConversationList.scss';

interface ConversationListProps {
  conversations: IConversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void; // Keep this prop for functionality, but remove button from UI
  onDeleteConversation: (id: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
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
    <div className="conversations-panel"> {/* Changed class name */}
      <div className="panel-header"> {/* New header structure */}
        <div className="panel-title">
          <i className="fas fa-comments"></i>
          对话列表
        </div>
        <div className="search-container">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            className="search-input"
            placeholder="搜索对话..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="conversation-list"> {/* Changed class name */}
        {filteredConversations.length > 0 ? (
          filteredConversations.map(conv => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeConversationId}
              onClick={onSelectConversation}
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