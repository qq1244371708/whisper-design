# Whisper Core BFF API 文档

## 概述

Whisper Core 是 Whisper Design 项目的 BFF（Backend for Frontend）层，提供统一的 API 接口，负责数据聚合、转换和代理功能。

**基础信息：**
- 服务地址：`http://localhost:3001`
- API 前缀：`/api`
- 版本：`v0.1.0`

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 错误响应
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint",
  "method": "GET"
}
```

## 健康检查

### GET /health
检查服务健康状态

**响应示例：**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "whisper-core",
  "version": "0.1.0"
}
```

## API 概览

### GET /api
获取 API 概览信息

**响应示例：**
```json
{
  "service": "whisper-core",
  "version": "0.1.0",
  "description": "BFF layer for Whisper Design",
  "endpoints": {
    "chat": "/api/chat",
    "users": "/api/users",
    "files": "/api/files",
    "proxy": "/api/proxy",
    "ssr": "/api/ssr"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 聊天相关 API

### 对话管理

#### GET /api/chat/conversations
获取对话列表

**查询参数：**
- `userId` (required): 用户ID
- `page` (optional): 页码，默认 1
- `limit` (optional): 每页数量，默认 20

**响应示例：**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "conv-1",
        "title": "AI助手对话",
        "lastUpdated": 1640995200000,
        "messages": []
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

#### POST /api/chat/conversations
创建新对话

**请求体：**
```json
{
  "title": "新对话",
  "userId": "user-123"
}
```

#### GET /api/chat/conversations/:conversationId
获取对话详情

**路径参数：**
- `conversationId`: 对话ID

**查询参数：**
- `page` (optional): 页码
- `limit` (optional): 每页消息数量

#### POST /api/chat/conversations/:conversationId/messages
发送消息

**请求体：**
```json
{
  "content": "Hello, AI!",
  "files": []
}
```

#### DELETE /api/chat/conversations/:conversationId
删除对话

**查询参数：**
- `userId` (required): 用户ID

## 用户相关 API

### 用户管理

#### GET /api/users/profile/:userId
获取用户信息

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "username": "demo_user",
    "email": "demo@example.com",
    "displayName": "演示用户",
    "status": "online",
    "preferences": {
      "theme": "light",
      "language": "zh-CN"
    }
  }
}
```

#### PUT /api/users/profile/:userId
更新用户信息

**请求体：**
```json
{
  "displayName": "新昵称",
  "preferences": {
    "theme": "dark"
  }
}
```

#### PATCH /api/users/status/:userId
更新用户状态

**请求体：**
```json
{
  "status": "online" // online, offline, away, busy
}
```

## 文件相关 API

### 文件管理

#### POST /api/files/upload
上传文件

**请求体：**
```json
{
  "files": [
    {
      "name": "example.txt",
      "size": 1024,
      "type": "text/plain",
      "data": "base64_encoded_data"
    }
  ],
  "userId": "user-123"
}
```

#### GET /api/files/:fileId
获取文件信息

#### GET /api/files/download/:fileId
下载文件

#### DELETE /api/files/:fileId
删除文件

**查询参数：**
- `userId` (required): 用户ID

## 代理相关 API

### 数据代理

#### ALL /api/proxy/*
通用代理接口，转发请求到数据服务层

#### POST /api/proxy/ai/chat
AI 服务代理

**请求体：**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello"
    }
  ],
  "model": "gpt-3.5-turbo",
  "temperature": 0.7,
  "maxTokens": 1000
}
```

#### POST /api/proxy/external/:service
外部服务代理

**请求体：**
```json
{
  "endpoint": "/api/data",
  "method": "POST",
  "data": {},
  "headers": {}
}
```

#### POST /api/proxy/aggregate
数据聚合接口

**请求体：**
```json
{
  "requests": [
    {
      "url": "/api/users/123",
      "method": "GET"
    },
    {
      "url": "/api/chat/conversations",
      "method": "GET",
      "query": { "userId": "123" }
    }
  ]
}
```

## SSR 相关 API

### 服务端渲染

#### POST /api/ssr/render
SSR 渲染接口

**请求体：**
```json
{
  "template": "default",
  "data": {
    "title": "页面标题",
    "content": "<div>页面内容</div>"
  },
  "options": {
    "enableCache": true,
    "cacheTTL": 600
  }
}
```

#### POST /api/ssr/prerender
预渲染接口

**请求体：**
```json
{
  "routes": ["/", "/about", "/contact"]
}
```

#### DELETE /api/ssr/cache
清理 SSR 缓存

**查询参数：**
- `pattern` (optional): 缓存键模式

#### GET /api/ssr/stats
获取 SSR 统计信息

#### POST /api/ssr/templates
注册模板

**请求体：**
```json
{
  "name": "custom-template",
  "template": "<!DOCTYPE html><html>...</html>"
}
```

## 错误代码

| 代码 | 描述 |
|------|------|
| `BAD_REQUEST` | 请求参数错误 |
| `UNAUTHORIZED` | 未授权访问 |
| `FORBIDDEN` | 禁止访问 |
| `NOT_FOUND` | 资源不存在 |
| `CONFLICT` | 资源冲突 |
| `UNPROCESSABLE_ENTITY` | 请求格式正确但语义错误 |
| `INTERNAL_SERVER_ERROR` | 服务器内部错误 |
| `SERVICE_UNAVAILABLE` | 服务不可用 |

## 认证

目前 API 暂未实现认证机制，所有接口都可以直接访问。在生产环境中，建议实现 JWT 或其他认证方式。

## 限流

API 默认限制每个 IP 在 15 分钟内最多 100 个请求。

## 开发调试

### 请求日志
所有请求都会记录详细的日志信息，包括：
- 请求 ID
- 请求方法和路径
- 响应状态码
- 响应时间
- 用户代理
- IP 地址

### 错误处理
开发环境下，错误响应会包含详细的堆栈信息。生产环境下只返回基本错误信息。

## 示例代码

### JavaScript/TypeScript
```typescript
// 获取对话列表
const response = await fetch('/api/chat/conversations?userId=123');
const data = await response.json();

// 发送消息
const messageResponse = await fetch('/api/chat/conversations/conv-1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: 'Hello, AI!',
    files: []
  })
});
```

### cURL
```bash
# 健康检查
curl http://localhost:3001/health

# 获取 API 概览
curl http://localhost:3001/api

# 创建对话
curl -X POST http://localhost:3001/api/chat/conversations \
  -H "Content-Type: application/json" \
  -d '{"title":"新对话","userId":"user-123"}'
```
