# AI Chat Room Components

A React component library for building AI chat room user interfaces. This library provides reusable UI components for chat functionalities, designed to be easily integrated into any React application.

## Features

-   **`AIChatRoom`**: A comprehensive component that integrates message display and input functionalities.
-   **`MessageBubble`**: Displays individual chat messages with customizable content and placement.
-   **`ChatInputArea`**: An input component for sending messages, now integrated with file upload capabilities.
-   **`FileUpload`**: Base component for uploading multiple files (images, PDF, XLSX) with card-style display.
-   **`Avatar`**: Displays user/AI avatars with customizable size and shape.
-   **`Button`**: A versatile button component with primary and secondary variants.
-   **`ChatMessagesList`**: Renders a scrollable list of chat messages.
-   **TypeScript Support**: Fully typed components for better development experience.
-   **Modular Design**: Components are designed with reusability and clear separation of concerns.

## Requirements

-   Node.js: `>=18.0.0`
-   React: `^19.0.0`

## Installation

To install the component library in your React project:

```bash
npm install ai-chat-room-components
# or
yarn add ai-chat-room-components
```

## Usage

### `AIChatRoom` Component

The primary component to quickly set up a chat interface.

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
      content: 'Hello! How can I help you today?',
      timestamp: dayjs().subtract(2, 'minute').valueOf(),
    },
    {
      id: '2',
      sender: 'user',
      content: 'I want to know about your features.',
      timestamp: dayjs().subtract(1, 'minute').valueOf(),
    },
  ]);
  const [isAITyping, setIsAITyping] = useState(false);

  const handleSendMessage = async (text: string, files: UploadedFile[]) => {
    const newUserMessage: IMessage = {
      id: uuid(),
      sender: 'user',
      content: text || (files.length > 0 ? `Sent ${files.length} files.` : ''),
      timestamp: dayjs().valueOf(),
      // You might want to handle files more specifically here, e.g., upload them
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    setIsAITyping(true);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate AI response delay

    const aiResponseContent = `You said: "${text}". I also received ${files.length} files. Thinking...`;
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
      <h2 style={{ textAlign: 'center', padding: '10px', borderBottom: '1px solid #eee' }}>AI Chat Demo</h2>
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

### Individual Component Usage

You can also import and use individual components:

```typescript jsx
import { Avatar, MessageBubble, ChatInputArea, FileUpload } from 'ai-chat-room-components';

// Example usage of Avatar
<Avatar src="path/to/avatar.png" alt="User" size="medium" shape="circle" />

// Example usage of MessageBubble
<MessageBubble id="msg1" content="Hello there!" placement="start" />

// Example usage of ChatInputArea (requires state management for files)
const [files, setFiles] = useState([]);
const handleSend = (message, uploadedFiles) => {
  console.log('Message:', message, 'Files:', uploadedFiles);
  setFiles([]); // Clear files after sending
};
<ChatInputArea onSendMessage={handleSend} onFilesChange={setFiles} value={files} />

// Example usage of FileUpload
const [uploadedFiles, setUploadedFiles] = useState([]);
<FileUpload onFilesChange={setUploadedFiles} value={uploadedFiles} acceptedFileTypes="image/*,.pdf" maxFiles={3} />
```

## Development

To set up the development environment:

1.  **Clone the repository:**
    ```bash
    git clone [repository-url]
    cd ai-chat-room-components
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server (demo):**
    ```bash
    npm run dev
    ```
    This will start a local development server and open the `ChatRoomDemo` page in your browser.

4.  **Build the library:**
    ```bash
    npm run build
    ```
    This compiles the library into the `dist` directory.

5.  **Linting:**
    ```bash
    npm run lint
    ```
