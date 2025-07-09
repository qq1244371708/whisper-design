import React, { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import { useImmer } from "use-immer";
import AIChatRoom from '../components/features/AIChatRoom/AIChatRoom';
import ConversationList from '../components/features/ConversationList/ConversationList';
import type { IMessage } from '../types/chat';
import type { UploadedFile } from '../components/base/FileUpload/interfaces'; // Added
import type { IConversation } from '../types/conversation';
import './ChatRoomDemo.scss';

const ChatRoomDemo: React.FC = () => {
  const [conversations, setConversations] = useImmer<IConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isAITyping, setIsAITyping] = useState(false);

  // Initialize with a default conversation if none exist
  useEffect(() => {
    if (conversations.length === 0) {
      handleNewConversation();
    }
  }, []); // Run once on mount

  const activeConversation = activeConversationId
    ? conversations.find(conv => conv.id === activeConversationId)
    : null;

  const handleNewConversation = () => {
    const newConvId = uuid();
    const newConversation: IConversation = {
      id: newConvId,
      title: `New Chat ${conversations.length + 1}`,
      messages: [],
      lastUpdated: dayjs().valueOf(),
    };
    setConversations(draft => {
      draft.unshift(newConversation); // Add to the beginning
    });
    setActiveConversationId(newConvId);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(draft => {
      const index = draft.findIndex(conv => conv.id === id);
      if (index !== -1) {
        draft.splice(index, 1);
      }
    });
    if (activeConversationId === id) {
      setActiveConversationId(conversations[0]?.id || null); // Switch to first or null
    }
  };

  // Removed handleUpdateConversationTitle as it's no longer used

  const handleSendMessage = async (text: string, files: UploadedFile[]) => {
    if (!activeConversationId) return;

    const newUserMessage: IMessage = {
      id: uuid(),
      sender: 'user',
      content: text || (files.length > 0 ? `Sent ${files.length} files.` : ''),
      timestamp: dayjs().valueOf(),
    };

    setConversations(draft => {
      const conv = draft.find(c => c.id === activeConversationId);
      if (conv) {
        conv.messages.push(newUserMessage);
        conv.lastUpdated = dayjs().valueOf();
      }
    });

    setIsAITyping(true);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate AI response delay

    const aiResponseContent = `好的，您发送了：“${text}”。我还收到了 ${files.length} 个文件。正在思考中...`;
    const newAIMessage: IMessage = {
      id: uuid(),
      sender: 'ai',
      content: aiResponseContent,
      timestamp: dayjs().valueOf(),
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
    <div style={{ display: "flex", height: "100vh", maxWidth: "1200px", margin: "0 auto", border: "1px solid #e0e0e0", borderRadius: "8px", overflow: "hidden" }}>
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        // Removed onUpdateConversationTitle as it's not used by ConversationList anymore
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px", padding: "10px", borderBottom: "1px solid #eee" }}>
          AI聊天室组件演示
        </h1>
        {activeConversation ? (
          <AIChatRoom
            messages={activeConversation.messages}
            onSendMessage={handleSendMessage}
            isAITyping={isAITyping}
            config={{
              userAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=User",
              aiAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AI",
              theme: 'light',
            }}
          />
        ) : (
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", color: "#888" }}>
            Select a conversation or start a new one.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoomDemo;
