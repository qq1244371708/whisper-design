import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import AIChatRoom from '../components/features/AIChatRoom/AIChatRoom';
import type { IMessage } from '../types/chat';
import './ChatRoomDemo.scss'; // Update SCSS import

const ChatRoomDemo: React.FC = () => {
  const [messages, setMessages] = useState<IMessage[]>([
    {
      id: "1",
      sender: 'ai',
      content: "您好！我是智能助手，有什么可以帮助您的吗？",
      timestamp: dayjs().subtract(2, 'minute').valueOf(),
    },
    {
      id: "2",
      sender: 'user',
      content: "我想了解一下如何使用AI聊天室组件",
      timestamp: dayjs().subtract(1, 'minute').valueOf(),
    },
    {
      id: "3",
      sender: 'ai',
      content: "AI聊天室组件是一个React组件库，它提供了构建聊天界面的基本UI元素和核心功能组件。",
      timestamp: dayjs().valueOf(),
    },
  ]);

  const [isAITyping, setIsAITyping] = useState(false);

  const handleSendMessage = async (text: string) => {
    const newUserMessage: IMessage = {
      id: uuid(),
      sender: 'user',
      content: text,
      timestamp: dayjs().valueOf(),
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    setIsAITyping(true);
    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay

    const aiResponseContent = `好的，您发送了：“${text}”。我正在思考如何回复您...`;
    const newAIMessage: IMessage = {
      id: uuid(),
      sender: 'ai',
      content: aiResponseContent,
      timestamp: dayjs().valueOf(),
    };
    setMessages((prevMessages) => [...prevMessages, newAIMessage]);
    setIsAITyping(false);
  };

  return (
    <div style={{ maxWidth: "600px", height: "80vh", margin: "20px auto", display: "flex", flexDirection: "column" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        AI聊天室组件演示
      </h1>
      <AIChatRoom
        messages={messages}
        onSendMessage={handleSendMessage}
        isAITyping={isAITyping}
        config={{
          userAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=User",
          aiAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AI",
          theme: 'light',
        }}
      />
    </div>
  );
};

export default ChatRoomDemo;
