import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import { useImmer } from 'use-immer';
import {
  AIChatRoom,
  ConversationList,
  type IMessage,
  type IConversation,
  type UploadedFile,
} from '@whisper-design/widget';
import '@whisper-design/widget/styles';

const ChatRoomDemo: React.FC = () => {
  console.log('[ demo ]');

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

  const handleSendMessage = async (text: string, files: UploadedFile[] = []) => {
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
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 左侧对话列表 */}
      <div
        style={{
          width: '305px',
          minWidth: '300px',
          height: '100vh',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />
      </div>

      {/* 右侧聊天区域 */}
      <div
        style={{
          flex: 1,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
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
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6c757d',
              backgroundColor: '#fff',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>
              Select a conversation to start chatting
            </h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Choose a conversation from the sidebar or create a new one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoomDemo;
