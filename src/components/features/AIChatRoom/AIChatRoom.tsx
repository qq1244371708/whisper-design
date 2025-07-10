import React, { useState } from 'react';
import type { IMessage, IChatConfig } from '../../../types/chat';
import type { UploadedFile } from '../../base/FileUpload/interfaces';
import ChatMessagesList from '../../composite/ChatMessagesList/ChatMessagesList';
import ChatInputArea from '../../composite/ChatInputArea/ChatInputArea';
import Avatar from '../../base/Avatar/Avatar'; // Import Avatar
import Button from '../../base/Button/Button'; // Import Button
import './AIChatRoom.scss';

interface AIChatRoomProps {
  messages: IMessage[];
  onSendMessage: (message: string, files: UploadedFile[]) => void;
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

  const handleSendMessage = async (message: string, files: UploadedFile[]) => {
    setIsSending(true);
    await onSendMessage(message, files);
    setIsSending(false);
  };

  return (
    <div className="chat-container"> {/* Changed class name */}
      <div className="chat-header"> {/* New header section */}
        <Avatar size="large" gradient="secondary">
          <i className="fas fa-robot"></i>
        </Avatar>
        <div className="chat-info">
          <div className="chat-title">AI助手</div>
          <div className="chat-status">
            <div className="status-indicator"></div>
            <span>{isAITyping ? '正在输入...' : '在线 · 响应迅速'}</span>
          </div>
        </div>
        <div className="chat-actions">
          <Button isCircle onClick={() => console.log('Phone clicked')}>
            <i className="fas fa-phone-alt"></i>
          </Button>
          <Button isCircle onClick={() => console.log('Video clicked')}>
            <i className="fas fa-video"></i>
          </Button>
          <Button isCircle onClick={() => console.log('Ellipsis clicked')}>
            <i className="fas fa-ellipsis-h"></i>
          </Button>
        </div>
      </div>
      <ChatMessagesList messages={messages} config={config} />
      <ChatInputArea
        onSendMessage={handleSendMessage}
        isSending={isSending || isAITyping}
        placeholder="输入消息..."
      />
    </div>
  );
};

export default AIChatRoom;