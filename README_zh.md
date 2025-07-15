# Whisper Design - AI 聊天平台

一个使用现代 Web 技术构建的综合 AI 聊天平台。这个 monorepo 包含一个完整的聊天系统，包括 UI 组件、BFF（Backend for Frontend）层和数据服务，专为构建可扩展的 AI 驱动聊天应用而设计。

## 🏗️ 架构

本项目遵循 **3 层 monorepo 架构**：

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端          │    │   BFF 层        │    │  数据服务       │
│  (whisper-widget)│◄──►│ (whisper-core)  │◄──►│(whisper-service)│
│                 │    │                 │    │                 │
│ • React UI      │    │ • API 网关      │    │ • 数据库        │
│ • 组件          │    │ • 数据转换      │    │ • 业务逻辑      │
│ • 状态管理      │    │ • 代理服务      │    │ • 认证          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 📦 包结构

- **`whisper-widget`** - React UI 组件库，包含聊天组件
- **`whisper-core`** - BFF 层，提供 API 网关和数据转换
- **`whisper-service`** - 数据服务层，包含数据库和业务逻辑
- **`demo`** - 演示应用，展示完整系统

## ✨ 功能特性

### UI 组件 (whisper-widget)
- **`AIChatRoomWithAPI`** - 完整的聊天界面，支持实时 API 集成
- **`ConversationListWithAPI`** - 对话管理，支持分页
- **`MessageBubble`** - 可自定义的消息显示，支持文件
- **`ChatInputArea`** - 丰富的输入区域，支持文件上传
- **`Avatar`** - 用户/AI 头像，多种样式
- **`FileUpload`** - 多文件上传，支持预览
- **TypeScript 支持** - 完全类型化，提升开发体验
- **SCSS 模块** - 模块化样式系统

### BFF 层 (whisper-core)
- **API 网关** - 统一 API 端点管理
- **数据转换** - 层间格式转换
- **代理服务** - 外部服务集成
- **速率限制** - 请求节流和保护
- **错误处理** - 集中式错误管理
- **请求日志** - 全面的请求跟踪

### 数据服务 (whisper-service)
- **RESTful APIs** - 完整的 CRUD 操作
- **数据库集成** - 使用 TypeORM，支持 SQLite/MySQL
- **认证** - 基于 JWT 的用户认证
- **消息管理** - 实时消息处理
- **文件存储** - 文件上传和管理
- **用户管理** - 用户配置文件和偏好设置

## 🚀 快速开始

### 前提条件

- **Node.js**: `>=18.0.0`
- **pnpm**: `>=8.0.0` (推荐的包管理器)
- **React**: `^19.0.0`

### 安装

1. **克隆仓库:**
   ```bash
   git clone https://github.com/your-username/whisper-design.git
   cd whisper-design
   ```

2. **安装依赖:**
   ```bash
   pnpm install
   ```

3. **启动所有服务:**
   ```bash
   # 终端 1: 启动数据服务 (端口 3002)
   cd packages/whisper-service
   pnpm dev

   # 终端 2: 启动 BFF 服务 (端口 3001)
   cd packages/whisper-core
   pnpm dev

   # 终端 3: 启动演示应用 (端口 5174)
   cd apps/demo
   pnpm dev
   ```

4. **打开浏览器:**
   ```
   http://localhost:5174
   ```

## 💻 使用方法

### 使用完整系统

演示应用展示了三层架构如何协同工作：

```typescript jsx
import React from 'react';
import {
  AIChatRoomWithAPI,
  ConversationListWithAPI,
} from '@whisper-design/widget';

const ChatApp = () => {
  const [activeConversationId, setActiveConversationId] = useState<string>();
  const userId = 'demo-user-123';

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* 对话列表 */}
      <div style={{ width: '320px' }}>
        <ConversationListWithAPI
          userId={userId}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onNewConversation={() => setActiveConversationId(undefined)}
        />
      </div>
      
      {/* 聊天界面 */}
      <div style={{ flex: 1 }}>
        <AIChatRoomWithAPI
          conversationId={activeConversationId}
          userId={userId}
          config={{
            userAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=User',
            aiAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AI',
            theme: 'light',
            aiModel: 'gpt-3.5-turbo',
          }}
        />
      </div>
    </div>
  );
};
```

### 使用单独组件

```typescript jsx
import { 
  Avatar, 
  MessageBubble, 
  ChatInputArea, 
  FileUpload 
} from '@whisper-design/widget';

// 头像组件
<Avatar 
  src="https://api.dicebear.com/7.x/initials/svg?seed=User" 
  alt="用户" 
  size="medium" 
  shape="circle" 
/>

// 消息气泡
<MessageBubble 
  id="msg1" 
  content="你好！" 
  sender="user"
  timestamp={Date.now()}
/>

// 带文件上传的聊天输入
<ChatInputArea
  onSendMessage={(message, files) => {
    console.log('消息:', message, '文件:', files);
  }}
  placeholder="输入你的消息..."
  showFileUpload={true}
/>
```

## 🛠️ 开发

### 项目结构

```
whisper-design/
├── apps/
│   └── demo/                 # 演示应用
├── packages/
│   ├── whisper-widget/       # UI 组件
│   │   ├── src/
│   │   │   ├── components/   # React 组件
│   │   │   │   ├── base/     # 基础 UI 组件
│   │   │   │   ├── composite/# 复合组件
│   │   │   │   └── features/ # 功能组件
│   │   │   ├── services/     # API 客户端服务
│   │   │   ├── types/        # TypeScript 定义
│   │   │   └── utils/        # 工具函数
│   │   └── package.json
│   │
│   ├── whisper-core/         # BFF 层
│   │   ├── src/
│   │   │   ├── api/          # API 路由
│   │   │   ├── clients/      # 数据服务客户端
│   │   │   ├── middleware/   # Express 中间件
│   │   │   └── services/     # 业务服务
│   │   └── package.json
│   │
│   └── whisper-service/      # 数据服务
│       ├── src/
│       │   ├── controllers/  # API 控制器
│       │   ├── entities/     # 数据库实体
│       │   ├── repositories/ # 数据访问
│       │   ├── services/     # 业务逻辑
│       │   └── middleware/   # 服务中间件
│       └── package.json
│
└── shared/                   # 共享代码
    └── types/                # 共享类型定义
```

### 开发工作流

1. **按顺序启动服务:**
   ```bash
   # 终端 1: 数据服务
   cd packages/whisper-service
   pnpm dev
   
   # 终端 2: BFF 服务
   cd packages/whisper-core
   pnpm dev
   
   # 终端 3: 演示应用
   cd apps/demo
   pnpm dev
   ```

2. **构建所有包:**
   ```bash
   pnpm build
   ```

3. **运行代码检查:**
   ```bash
   pnpm lint
   ```

4. **类型检查:**
   ```bash
   pnpm type-check
   ```

## 📝 API 文档

### 核心组件

- **`AIChatRoomWithAPI`**: 完整的聊天界面，支持 API 集成
- **`ConversationListWithAPI`**: 对话管理组件
- **`ChatInputArea`**: 消息输入，支持文件上传
- **`MessageBubble`**: 单个消息显示

### 核心服务

- **聊天服务**: 对话和消息管理
- **用户服务**: 用户认证和配置文件
- **文件服务**: 文件上传和管理