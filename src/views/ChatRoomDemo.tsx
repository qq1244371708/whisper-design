import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import { useImmer } from 'use-immer';
import AIChatRoom from '../components/features/AIChatRoom/AIChatRoom';
import ConversationList from '../components/features/ConversationList/ConversationList';
import type { IMessage } from '../types/chat';
import type { UploadedFile } from '../components/base/FileUpload/interfaces';
import type { IConversation } from '../types/conversation';
import './ChatRoomDemo.scss';

const ChatRoomDemo: React.FC = () => {
  const [conversations, setConversations] = useImmer<IConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isAITyping, setIsAITyping] = useState(false);

  // Initialize with a default conversation if none exist
  const handleNewConversation = useCallback(() => {
    const newConvId = uuid();
    const newConversation: IConversation = {
      id: newConvId,
      title: `New Chat ${conversations.length + 1}`,
      messages: [],
      lastUpdated: dayjs().valueOf(),
    };
    setConversations(draft => {
      draft.unshift(newConversation);
    });
    setActiveConversationId(newConvId);
  }, [conversations.length, setConversations]);

  useEffect(() => {
    if (conversations.length === 0) {
      handleNewConversation();
    }
  }, [conversations.length, handleNewConversation]);

  const activeConversation = activeConversationId
    ? conversations.find(conv => conv.id === activeConversationId)
    : null;



  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };



  const handleSendMessage = async (text: string, files: UploadedFile[]) => {
    if (!activeConversationId) return;

    const newUserMessage: IMessage = {
      id: uuid(),
      sender: 'user',
      content: text,
      timestamp: dayjs().valueOf(),
      ...(files.length > 0 && { files }),
    };

    setConversations(draft => {
      const conv = draft.find(c => c.id === activeConversationId);
      if (conv) {
        conv.messages.push(newUserMessage);
        conv.lastUpdated = dayjs().valueOf();
      }
    });

    setIsAITyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    let aiResponseContent = `好的，您发送了：“${text}”。`;
    if (files.length > 0) {
      aiResponseContent += `我还收到了 ${files.length} 个文件。`;
    }

    const newAIMessage: IMessage = {
      id: uuid(),
      sender: 'ai',
      content: aiResponseContent,
      timestamp: dayjs().valueOf(),
      type: 'text',
    };

    setConversations(draft => {
      const conv = draft.find(c => c.id === activeConversationId);
      if (conv) {
        conv.messages.push(newAIMessage);
        conv.lastUpdated = dayjs().valueOf();
      }
    });

    setIsAITyping(false);
  };

  return (
    <div className="container">
      {' '}
      {/* Applied container class */}
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />
      {activeConversation ? (
        <AIChatRoom
          messages={activeConversation.messages}
          onSendMessage={handleSendMessage}
          isAITyping={isAITyping}
          conversationTitle={
            activeConversation.messages.length > 0 && activeConversation.messages[0]
              ? activeConversation.messages[0].content.substring(0, 30) +
                (activeConversation.messages[0].content.length > 30 ? '...' : '')
              : activeConversation.title
          }
          config={{
            userAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=用户',
            aiAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot',
            theme: 'light',
          }}
        />
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#888',
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '16px',
            border: '1px solid rgba(77, 142, 255, 0.15)',
            boxShadow: '0 4px 12px rgba(77, 142, 255, 0.2)',
          }}
        >
          Select a conversation or start a new one.
        </div>
      )}
    </div>
  );
};

export default ChatRoomDemo;
