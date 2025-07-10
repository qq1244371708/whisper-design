import React, { useState } from 'react';
import type { IMessage, IChatConfig } from '../../../types/chat';
import type { UploadedFile } from '../../base/FileUpload/interfaces';
import ChatMessagesList from '../../composite/ChatMessagesList/ChatMessagesList';
import ChatInputArea from '../../composite/ChatInputArea/ChatInputArea';
import PromptSet from '../../composite/PromptSet/PromptSet';
import './AIChatRoom.scss';

interface AIChatRoomProps {
  messages: IMessage[];
  onSendMessage: (message: string, files: UploadedFile[]) => void;
  isAITyping?: boolean;
  config?: IChatConfig;
  conversationTitle?: string;
}

const AIChatRoom: React.FC<AIChatRoomProps> = ({
  messages,
  onSendMessage,
  isAITyping = false,
  config,
  conversationTitle,
}) => {
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (message: string, files: UploadedFile[]) => {
    if (isSending) return; // Prevent multiple sends
    setIsSending(true);
    await onSendMessage(message, files);
    setIsSending(false);
  };

  // Handler for prompt clicks, sends message without files
  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt, []);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">{conversationTitle || '新对话'}</div>
      </div>
      <div className="chat-body">
        {messages.length === 0 ? (
          <PromptSet onPromptClick={handlePromptClick} />
        ) : (
          <ChatMessagesList messages={messages} {...(config && { config })} />
        )}
      </div>
      <ChatInputArea
        onSendMessage={handleSendMessage}
        isSending={isSending || isAITyping}
        placeholder="输入消息..."
      />
    </div>
  );
};

export default AIChatRoom;
