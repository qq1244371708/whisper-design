import React, { useState } from "react";
import Sender from "@/components/Sender/Sender";
import Bubble from "@/components/Bubble/Bubble";
import type { BubbleProps } from "@/components/Bubble/interfaces";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";

const ChatPage: React.FC = () => {
  // 示例聊天数据
  const [messages, setMessages] = useState<BubbleProps[]>([
    {
      id: "1",
      content: "您好！我是智能助手，有什么可以帮助您的吗？",
      avatar: "🤖",
      header: "AI助手",
      footer: "10:00",
    },
    {
      id: "2",
      content: "我想了解一下如何使用Bubble组件",
      avatar: "👤",
      header: "用户",
      footer: "10:01",
      placement: "end",
    },
    {
      id: "3",
      content:
        "Bubble组件支持自定义头像、内容、头部和底部信息，您可以根据需要传入不同的props来定制聊天气泡的显示效果。",
      avatar: "🤖",
      header: "AI助手",
      footer: "10:02",
    },
  ]);

  return (
    <>
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
          AI聊天演示
        </h1>
        <div className="chat-messages">
          {messages.map((msg) => (
            <Bubble
              id={msg.id}
              key={msg.id}
              avatar={msg.avatar}
              content={msg.content}
              header={msg.header}
              footer={msg.footer}
              placement={msg.placement}
              // className={`bubble-container is-${msg.sender}`}
            />
          ))}
        </div>
      </div>
      <Sender
        onSend={(message) => {
          setMessages([
            ...messages,
            {
              id: uuid(),
              content: message,
              avatar: "👤",
              header: "用户",
              footer: dayjs().format("HH:mm"),
              placement: "end",
            },
            {
              id: uuid(),
              content: `回答：${message}`,
              avatar: "🤖",
              header: "AI助手",
              footer: dayjs().format("HH:mm"),
            },
          ]);
        }}
      />
    </>
  );
};

export default ChatPage;
