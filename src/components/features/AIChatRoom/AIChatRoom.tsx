import React, { useState } from 'react';
import type { IMessage, IChatConfig } from '../../../types/chat';
import type { UploadedFile } from '../../base/FileUpload/interfaces'; // Added
import ChatMessagesList from '../../composite/ChatMessagesList/ChatMessagesList';
import ChatInputArea from '../../composite/ChatInputArea/ChatInputArea'; // Moved to composite
import './AIChatRoom.scss';

interface AIChatRoomProps {
  messages: IMessage[];
  onSendMessage: (message: string, files: UploadedFile[]) => void; // Modified
  isAITyping?: boolean;
  config?: IChatConfig;
}

const AIChatRoom: React.FC<AIChatRoomProps> = ({
  messages,
  onSendMessage,
  isAITyping = false,
  config,
}) => {
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (message: string, files: UploadedFile[]) => { // Added files parameter
    setIsSending(true);
    await onSendMessage(message, files); // Pass files to onSendMessage
    setIsSending(false);
  };

  return (
    <div className="ai-chat-room">
      <ChatMessagesList messages={messages} config={config} />
      <ChatInputArea
        onSendMessage={handleSendMessage}
        isSending={isSending || isAITyping}
        placeholder="Ask me anything..."
      />
    </div>
  );
};

export default AIChatRoom;
