# Whisper Design - AI Chat Platform

A comprehensive AI chat platform built with modern web technologies. This monorepo contains a complete chat system with UI components, BFF (Backend for Frontend) layer, and data services, designed for building scalable AI-powered chat applications.

## 🏗️ Architecture

This project follows a **3-tier monorepo architecture**:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   BFF Layer     │    │  Data Service   │
│ (whisper-widget)│◄──►│ (whisper-core)  │◄──►│(whisper-service)│
│                 │    │                 │    │                 │
│ • React UI      │    │ • API Gateway   │    │ • Database      │
│ • Components    │    │ • Data Transform│    │ • Business Logic│
│ • State Mgmt    │    │ • Proxy Service │    │ • Authentication│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 📦 Packages

- **`whisper-widget`** - React UI component library with chat components
- **`whisper-core`** - BFF layer providing API gateway and data transformation
- **`whisper-service`** - Data service layer with database and business logic
- **`demo`** - Demo application showcasing the complete system

## ✨ Features

### UI Components (whisper-widget)
- **`AIChatRoomWithAPI`** - Complete chat interface with real-time API integration
- **`ConversationListWithAPI`** - Conversation management with pagination
- **`MessageBubble`** - Customizable message display with file support
- **`ChatInputArea`** - Rich input with file upload capabilities
- **`Avatar`** - User/AI avatars with multiple styles
- **`FileUpload`** - Multi-file upload with preview
- **TypeScript Support** - Fully typed for better DX
- **SCSS Modules** - Modular styling system

### BFF Layer (whisper-core)
- **API Gateway** - Unified API endpoint management
- **Data Transformation** - Format conversion between layers
- **Proxy Service** - External service integration
- **Rate Limiting** - Request throttling and protection
- **Error Handling** - Centralized error management
- **Request Logging** - Comprehensive request tracking

### Data Service (whisper-service)
- **RESTful APIs** - Complete CRUD operations
- **Database Integration** - TypeORM with SQLite/MySQL support
- **Authentication** - JWT-based user authentication
- **Message Management** - Real-time message handling
- **File Storage** - File upload and management
- **User Management** - User profiles and preferences

## 🚀 Quick Start

### Prerequisites

- **Node.js**: `>=18.0.0`
- **pnpm**: `>=8.0.0` (recommended package manager)
- **React**: `^19.0.0`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/whisper-design.git
   cd whisper-design
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start all services:**
   ```bash
   # Terminal 1: Start data service (port 3002)
   cd packages/whisper-service
   pnpm dev

   # Terminal 2: Start BFF service (port 3001)
   cd packages/whisper-core
   pnpm dev

   # Terminal 3: Start demo app (port 5174)
   cd apps/demo
   pnpm dev
   ```

4. **Open your browser:**
   ```
   http://localhost:5174
   ```

## 💻 Usage

### Using the Complete System

The demo application shows how all three layers work together:

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
      {/* Conversation List */}
      <div style={{ width: '320px' }}>
        <ConversationListWithAPI
          userId={userId}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onNewConversation={() => setActiveConversationId(undefined)}
        />
      </div>

      {/* Chat Interface */}
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

### Using Individual Components

```typescript jsx
import {
  Avatar,
  MessageBubble,
  ChatInputArea,
  FileUpload
} from '@whisper-design/widget';

// Avatar component
<Avatar
  src="https://api.dicebear.com/7.x/initials/svg?seed=User"
  alt="User"
  size="medium"
  shape="circle"
/>

// Message bubble
<MessageBubble
  id="msg1"
  content="Hello there!"
  sender="user"
  timestamp={Date.now()}
/>

// Chat input with file upload
<ChatInputArea
  onSendMessage={(message, files) => {
    console.log('Message:', message, 'Files:', files);
  }}
  placeholder="Type your message..."
  showFileUpload={true}
/>
```

## 🛠️ Development

### Project Structure

```
whisper-design/
├── apps/
│   └── demo/                 # Demo application
├── packages/
│   ├── whisper-widget/       # UI components
│   │   ├── src/
│   │   │   ├── components/   # React components
│   │   │   │   ├── base/     # Base UI components
│   │   │   │   ├── composite/# Composite components
│   │   │   │   └── features/ # Feature components
│   │   │   ├── services/     # API client services
│   │   │   ├── types/        # TypeScript definitions
│   │   │   └── utils/        # Utility functions
│   │   └── package.json
│   │
│   ├── whisper-core/         # BFF layer
│   │   ├── src/
│   │   │   ├── api/          # API routes
│   │   │   ├── clients/      # Data service clients
│   │   │   ├── middleware/   # Express middleware
│   │   │   └── services/     # Business services
│   │   └── package.json
│   │
│   └── whisper-service/      # Data service
│       ├── src/
│       │   ├── controllers/  # API controllers
│       │   ├── entities/     # Database entities
│       │   ├── repositories/ # Data access
│       │   ├── services/     # Business logic
│       │   └── middleware/   # Service middleware
│       └── package.json
│
└── shared/                   # Shared code
    └── types/                # Shared type definitions
```

### Development Workflow

1. **Start the services in order:**
   ```bash
   # Terminal 1: Data service
   cd packages/whisper-service
   pnpm dev

   # Terminal 2: BFF service
   cd packages/whisper-core
   pnpm dev

   # Terminal 3: Demo app
   cd apps/demo
   pnpm dev
   ```

2. **Build all packages:**
   ```bash
   pnpm build
   ```

3. **Run linting:**
   ```bash
   pnpm lint
   ```

4. **Type checking:**
   ```bash
   pnpm type-check
   ```

## 📝 API Documentation

### Key Components

- **`AIChatRoomWithAPI`**: Complete chat interface with API integration
- **`ConversationListWithAPI`**: Conversation management component
- **`ChatInputArea`**: Message input with file upload
- **`MessageBubble`**: Individual message display

### Key Services

- **Chat Service**: Conversation and message management
- **User Service**: User authentication and profiles
- **File Service**: File upload and management