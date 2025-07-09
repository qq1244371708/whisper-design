# AI 聊天室组件库

一个用于构建 AI 聊天室用户界面的 React 组件库。该库提供可重用的聊天功能 UI 组件，旨在轻松集成到任何 React 应用程序中。

## 特性

-   **`AIChatRoom`**: 一个综合组件，集成了消息显示和输入功能。
-   **`MessageBubble`**: 显示单个聊天消息，内容和位置可自定义。
-   **`ChatInputArea`**: 一个用于发送消息的输入组件，现已集成文件上传功能。
-   **`FileUpload`**: 基础组件，用于上传多个文件（图片、PDF、XLSX），并以卡片样式显示。
-   **`Avatar`**: 显示用户/AI 头像，大小和形状可自定义。
-   **`Button`**: 一个多功能的按钮组件，提供主要和次要变体。
-   **`ChatMessagesList`**: 渲染可滚动的聊天消息列表。
-   **TypeScript 支持**: 全面类型化的组件，提供更好的开发体验。
-   **模块化设计**: 组件设计注重可重用性和清晰的职责分离。

## 要求

-   Node.js: `>=18.0.0`
-   React: `^19.0.0`

## 安装

在你的 React 项目中安装组件库：

```bash
npm install ai-chat-room-components
# 或
yarn add ai-chat-room-components
```

## 使用

### `AIChatRoom` 组件

快速设置聊天界面的主要组件。

```typescript jsx
import React, { useState } from 'react';
import { AIChatRoom, IMessage, MessageSender, UploadedFile } from 'ai-chat-room-components';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';

const MyChatApp = () => {
  const [messages, setMessages] = useState<IMessage[]>([
    {
      id: '1',
      sender: 'ai',
      content: '您好！我能为您提供什么帮助？',
      timestamp: dayjs().subtract(2, 'minute').valueOf(),
    },
    {
      id: '2',
      sender: 'user',
      content: '我想了解一下您的功能。',
      timestamp: dayjs().subtract(1, 'minute').valueOf(),
    },
  ]);
  const [isAITyping, setIsAITyping] = useState(false);

  const handleSendMessage = async (text: string, files: UploadedFile[]) => {
    const newUserMessage: IMessage = {
      id: uuid(),
      sender: 'user',
      content: text || (files.length > 0 ? `发送了 ${files.length} 个文件。` : ''),
      timestamp: dayjs().valueOf(),
      // 你可能需要在这里更具体地处理文件，例如上传它们
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    setIsAITyping(true);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // 模拟 AI 响应延迟

    const aiResponseContent = `您说：“${text}”。我还收到了 ${files.length} 个文件。正在思考中...`;
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
    <div style={{ maxWidth: '600px', height: '80vh', margin: '20px auto', display: 'flex', flexDirection: 'column', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
      <h2 style={{ textAlign: 'center', padding: '10px', borderBottom: '1px solid #eee' }}>AI 聊天演示</h2>
      <AIChatRoom
        messages={messages}
        onSendMessage={handleSendMessage}
        isAITyping={isAITyping}
        config={{
          userAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=User',
          aiAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AI',
          theme: 'light',
        }}
      />
    </div>
  );
};

export default MyChatApp;
```

### 单个组件使用

你也可以导入并使用单个组件：

```typescript jsx
import { Avatar, MessageBubble, ChatInputArea, FileUpload } from 'ai-chat-room-components';

// Avatar 使用示例
<Avatar src="path/to/avatar.png" alt="用户" size="medium" shape="circle" />

// MessageBubble 使用示例
<MessageBubble id="msg1" content="你好！" placement="start" />

// ChatInputArea 使用示例（需要文件状态管理）
const [files, setFiles] = useState([]);
const handleSend = (message, uploadedFiles) => {
  console.log('消息:', message, '文件:', uploadedFiles);
  setFiles([]); // 发送后清空文件
};
<ChatInputArea onSendMessage={handleSend} onFilesChange={setFiles} value={files} />

// FileUpload 使用示例
const [uploadedFiles, setUploadedFiles] = useState([]);
<FileUpload onFilesChange={setUploadedFiles} value={uploadedFiles} acceptedFileTypes="image/*,.pdf" maxFiles={3} />
```

## 开发

设置开发环境：

1.  **克隆仓库：**
    ```bash
    git clone [repository-url]
    cd ai-chat-room-components
    ```
2.  **安装依赖：**
    ```bash
    npm install
    ```
3.  **运行开发服务器（演示）：**
    ```bash
    npm run dev
    ```
    这将在本地启动开发服务器，并在浏览器中打开 `ChatRoomDemo` 页面。

4.  **构建库：**
    ```bash
    npm run build
    ```
    这会将库编译到 `dist` 目录。

5.  **代码检查：**
    ```bash
    npm run lint
    ```
