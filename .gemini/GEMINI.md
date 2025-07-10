## 项目规划：React AI 聊天室组件库

### 1. 项目目标

*   构建一个基于 **React + Vite** 的 AI 聊天室 UI 组件库。
*   组件库将发布到 **npm**，供其他 React 项目灵活引用。
*   组件库本身不涉及后端接口，专注于提供纯前端 UI 交互。
*   组件设计遵循分层原则，便于复用和维护。

### 2. 详细工程规划

#### 2.1. 项目初始化与基础配置

*   **目标**：确保项目结构清晰，开发环境配置完善，为组件库开发做好准备。
*   **操作**：
    *   **清理现有代码**：移除 `src` 目录下与组件库无关的现有示例代码。
    *   **Vite 配置优化**：检查并配置 `vite.config.ts`，确保其支持 React 和 TypeScript，并为后续的库模式打包做好准备。
    *   **代码规范**：确认 `eslint.config.js` 和 `.prettierrc.json` 配置正确，强制执行代码风格一致性。
    *   **目录结构调整**：
        *   `src/components/base`：存放最基础、原子化的 UI 组件。
        *   `src/components/composite`：存放由基础组件组合而成的复合组件。
        *   `src/components/features`：存放核心功能组件，如 `AIChatRoom`，这是库的主要导出。
        *   `src/types`：存放 TypeScript 类型定义文件。
        *   `src/views`：存放用于本地开发和调试的示例页面（如 `Chat` 页面）。
        *   `src/assets`：存放静态资源。
        *   `src/styles`：存放全局样式或变量。

#### 2.2. 核心类型定义

*   **目标**：定义组件间共享的数据结构，提高代码可读性和类型安全性。
*   **操作**：
    *   在 `src/types/chat.ts` 中定义聊天消息的接口 `IMessage` 和配置接口 `IChatConfig`，以及字符串联合类型 `MessageSender`, `MessageType`, `ChatTheme`。
    *   在 `src/types/conversation.ts` 中定义会话接口 `IConversation`。

    ```typescript
    // src/types/chat.ts
    export interface IMessage {
      id: string;
      sender: 'user' | 'ai';
      content: string; // 可以是文本、图片URL等
      timestamp: number; // 时间戳
      type?: 'text' | 'image' | 'code'; // 消息类型
      isLoading?: boolean; // AI消息是否正在生成中
    }

    export interface IChatConfig {
      theme?: 'light' | 'dark';
      userAvatar?: string;
      aiAvatar?: string;
    }

    export type MessageSender = 'user' | 'ai';
    export type MessageType = 'text' | 'image' | 'code';
    export type ChatTheme = 'light' | 'dark';
    ```

    ```typescript
    // src/types/conversation.ts
    import type { IMessage } from './chat';

    export interface IConversation {
      id: string;
      title: string; // Display name for the conversation (e.g., "New Chat", "Chat about React")
      messages: IMessage[]; // Array of messages in this conversation
      lastUpdated: number; // Timestamp of the last message or update
      isPinned?: boolean; // Optional: for pinning important conversations
    }
    ```

#### 2.3. 基础组件开发 (`src/components/base`)

*   **目标**：构建可复用的原子化 UI 元素。
*   **组件列表与 Props 规划**：
    *   **`Avatar`**：
        *   `props`: `src: string`, `alt: string`, `size?: 'small' | 'medium' | 'large'`, `shape?: 'circle' | 'square'`.
        *   `功能`: 显示用户或 AI 的头像。
    *   **`MessageBubble`**：
        *   `props`: `id: string | number`, `content: ContentType`, `placement?: 'start' | 'end'`, `isLoading?: boolean`.
        *   `功能`: 纯粹的消息内容展示，不包含发送者信息或布局。
    *   **`Button`**：
        *   `props`: `onClick: () => void`, `children: React.ReactNode`, `variant?: 'primary' | 'secondary'`, `disabled?: boolean`, `type?: 'button' | 'submit' | 'reset'`.
        *   `功能`: 通用按钮。
    *   **`FileUpload`**：
        *   `props`: `onFilesChange: (files: UploadedFile[]) => void`, `acceptedFileTypes?: string`, `maxFiles?: number`, `value?: UploadedFile[]`, `disabled?: boolean`.
        *   `功能`: 文件上传功能，支持多文件、图片/PDF/XLSX格式，并展示为卡片列表。

#### 2.4. 复合组件开发 (`src/components/composite`)

*   **目标**：组合基础组件，形成更复杂的 UI 模块。
*   **组件列表与 Props 规划**：
    *   **`ChatMessage`**：
        *   `props`: `message: IMessage`, `config?: IChatConfig`.
        *   `功能`: 结合 `Avatar` 和 `MessageBubble`，展示一条完整的聊天消息（包含发送者头像、消息内容和布局）。
    *   **`ChatMessagesList`**：
        *   `props`: `messages: IMessage[]`, `config?: IChatConfig`, `isLoadingMore?: boolean`.
        *   `功能`: 渲染 `ChatMessage` 列表，处理滚动和消息加载。
    *   **`ChatInputArea`**：
        *   `props`: `onSendMessage: (message: string, files: UploadedFile[]) => void`, `isSending?: boolean`, `placeholder?: string`, `onFilesChange?: (files: UploadedFile[]) => void`.
        *   `功能`: 组合 `FileUpload`、输入框和发送按钮，提供消息输入和文件上传功能。
    *   **`ConversationItem`**：
        *   `props`: `conversation: IConversation`, `isActive: boolean`, `onClick: (id: string) => void`, `onDelete: (id: string) => void`, `onEditTitle: (id: string, newTitle: string) => void`.
        *   `功能`: 显示单个会话的标题、最后一条消息片段和更新时间，并提供交互。
    *   **`PromptSet`**：
        *   `props`: `onPromptClick: (prompt: string) => void`.
        *   `功能`: 在新会话或空会话中显示欢迎语和一组可点击的提示问题，以引导用户。

#### 2.5. 核心功能组件开发 (`src/components/features`)

*   **目标**：构建组件库的主要导出组件，集成所有子组件。
*   **组件列表与 Props 规划**：
    *   **`AIChatRoom`**：
        *   `props`: `messages: IMessage[]`, `onSendMessage: (message: string) => void`, `isAITyping?: boolean`, `config?: IChatConfig`.
        *   `功能`: 整合 `ChatMessagesList`、`ChatInputArea` 和 `PromptSet`，形成完整的 AI 聊天室界面。当消息列表为空时，显示 `PromptSet`。
    *   **`ConversationList`**：
        *   `props`: `conversations: IConversation[]`, `activeConversationId: string | null`, `onSelectConversation: (id: string) => void`, `onNewConversation: () => void`, `onDeleteConversation: (id: string) => void`, `onUpdateConversationTitle: (id: string, newTitle: string) => void`, `onSearch: (query: string) => void`.
        *   `功能`: 管理和显示会话列表，包括新增、切换、搜索等。

#### 2.6. 示例页面与本地调试 (`src/views`)

*   **目标**：提供一个可运行的示例，用于组件的本地开发、调试和功能演示。
*   **操作**：
    *   在 `src/views/ChatRoomDemo.tsx` 中，导入并使用 `AIChatRoom` 和 `ConversationList` 组件。
    *   模拟消息数据和发送逻辑，展示 `AIChatRoom` 的完整功能。
    *   此页面仅用于开发调试，不会打包到最终的组件库中。

#### 2.7. 库模式打包配置与组件导出策略

*   **目标**：配置 Vite，将组件库打包成可供其他项目导入和使用的格式，并确保所有组件都能被灵活引用。
*   **操作**：
    *   **创建主导出文件**：在 `src` 目录下创建一个 `index.ts` 文件，作为组件库的统一导出入口。`export * from` 所有希望对外暴露的基础组件、复合组件和核心功能组件。
    *   **修改 `vite.config.ts`**：将 `build.lib.entry` 指向这个统一的 `index.ts` 文件，并配置库名称和文件名。
    *   **`package.json` 配置**：
        *   `main`, `module`, `types` 字段指向打包后的主入口文件。
        *   **推荐使用 `exports` 字段**：为了更好地支持子路径导入和模块化，在 `package.json` 中配置 `exports` 字段，允许消费者按需导入各个组件。

#### 2.8. 文档与类型声明

*   **目标**：为组件库提供清晰的文档和完整的 TypeScript 类型声明。
*   **操作**：
    *   为每个组件及其 Props 添加 JSDoc 注释。
    *   确保 Vite 或 TypeScript 编译器正确生成 `.d.ts` 类型声明文件。
    *   编写 `README.md`，包含安装、使用示例、API 文档等。

#### 2.9. 测试策略

*   **目标**：确保组件的质量和稳定性。
*   **操作**：
    *   设置测试框架（如 Vitest + React Testing Library）。
    *   为关键的基础组件和复合组件编写单元测试和集成测试。

#### 2.10. 发布到 NPM

*   **目标**：将组件库发布到 npm 仓库，供其他项目使用。
*   **操作**：
    *   在 `package.json` 中设置正确的 `name`、`version`、`description`、`keywords`、`repository`、`author`、`license` 等信息。
    *   确保 `files` 字段包含所有需要发布的文件（打包后的产物、类型声明、README 等）。
