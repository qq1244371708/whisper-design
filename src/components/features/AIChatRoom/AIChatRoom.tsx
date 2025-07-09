import React, { useState } from 'react';
import type { IMessage, IChatConfig } from '../../../types/chat';
import ChatMessagesList from '../../composite/ChatMessagesList/ChatMessagesList';
import ChatInputArea from '../../composite/ChatInputArea/ChatInputArea'; // Moved to composite
import './AIChatRoom.scss';

interface AIChatRoomProps {
  messages: IMessage[];
  onSendMessage: (message: string) => void;
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

  const handleSendMessage = async (message: string) => {
    setIsSending(true);
    await onSendMessage(message); // Assuming onSendMessage can be async
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
