import React, { useState, useEffect, useCallback } from 'react';
import type { IConversation } from '../../../types/conversation';
import { chatService } from '../../../services';
import ConversationItem from '../../composite/ConversationItem/ConversationItem';
import Button from '../../base/Button/Button';
import './ConversationList.scss';

interface ConversationListWithAPIProps {
  userId: string;
  activeConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  onError?: (error: Error) => void;
}

const ConversationListWithAPI: React.FC<ConversationListWithAPIProps> = ({
  userId,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onError,
}) => {
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // 加载对话列表
  const loadConversations = useCallback(async (pageNum = 1, append = false) => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await chatService.getConversations({
        userId,
        page: pageNum,
        limit: 20,
      });

      if (append) {
        setConversations(prev => [...prev, ...response.items]);
      } else {
        setConversations(response.items);
      }

      setTotal(response.total);
      setHasMore(response.items.length === 20 && response.page * 20 < response.total);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, onError]);

  // 创建新对话
  const handleNewConversation = async () => {
    try {
      const conversation = await chatService.createConversation({
        title: '新对话',
        userId,
      });

      // 将新对话添加到列表顶部
      setConversations(prev => [conversation, ...prev]);
      setTotal(prev => prev + 1);

      // 自动选择新创建的对话
      onSelectConversation(conversation.id);

      console.log('New conversation created and selected:', conversation.id);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      onError?.(error as Error);
    }
  };

  // 删除对话
  const handleDeleteConversation = async (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // 防止触发选择事件

    if (!confirm('确定要删除这个对话吗？')) {
      return;
    }

    try {
      await chatService.deleteConversation(conversationId, userId);
      
      // 从列表中移除
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      setTotal(prev => prev - 1);

      // 如果删除的是当前选中的对话，清除选择
      if (conversationId === activeConversationId) {
        // 可以选择第一个对话或者创建新对话
        const remainingConversations = conversations.filter(conv => conv.id !== conversationId);
        if (remainingConversations.length > 0) {
          onSelectConversation(remainingConversations[0].id);
        } else {
          onNewConversation();
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      onError?.(error as Error);
    }
  };

  // 加载更多对话
  const loadMore = () => {
    if (!isLoading && hasMore) {
      loadConversations(page + 1, true);
    }
  };



  // 初始加载
  useEffect(() => {
    if (userId) {
      loadConversations();
    }
  }, [userId, loadConversations]);

  // 自动选择第一个对话（仅在初始加载且没有活跃对话时）
  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      const firstConversation = conversations[0];
      onSelectConversation(firstConversation.id);
      console.log('Auto-selected first conversation:', firstConversation.id, 'title:', firstConversation.title);
    }
  }, [conversations, activeConversationId, onSelectConversation]);

  return (
    <div className="conversations-panel">
      <div className="panel-header">
        <div className="panel-title">
          <i className="fas fa-comments"></i>
          对话列表
          <Button
            isCircle
            onClick={handleNewConversation}
            className="new-conversation-btn"
            disabled={isLoading}
          >
            <i className="fas fa-plus"></i>
          </Button>
        </div>
      </div>

      <div className="conversation-list">
        {conversations.length === 0 && !isLoading ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>还没有对话</p>
            <button 
              className="create-first-btn"
              onClick={handleNewConversation}
            >
              创建第一个对话
            </button>
          </div>
        ) : (
          <>
            {conversations.map((conversation) => (
              <div key={conversation.id} className="conversation-item-wrapper">
                <ConversationItem
                  conversation={conversation}
                  isActive={conversation.id === activeConversationId}
                  onClick={onSelectConversation}
                />
                <button
                  className="delete-btn"
                  onClick={(e) => handleDeleteConversation(conversation.id, e)}
                  title="删除对话"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}

            {hasMore && (
              <div className="load-more">
                <button 
                  onClick={loadMore}
                  disabled={isLoading}
                  className="load-more-btn"
                >
                  {isLoading ? '加载中...' : '加载更多'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {isLoading && conversations.length === 0 && (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          <span>加载对话列表...</span>
        </div>
      )}

      <div className="conversation-list-footer">
        <div className="conversation-count">
          共 {total} 个对话
        </div>
      </div>
    </div>
  );
};

export default ConversationListWithAPI;
