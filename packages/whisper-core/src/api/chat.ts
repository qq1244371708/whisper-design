import { Router, Request, Response, NextFunction } from 'express';
import { createError } from '../middleware/errorHandler';
import { chatService } from '../services/chatService';
// import type { IMessage, IConversation, SendMessageParams } from '@shared/types';

// 临时类型定义
interface SendMessageParams {
  content?: string;
  files?: any[];
  sender?: 'user' | 'ai';
}

const router: Router = Router();

// 获取对话列表
router.get('/conversations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, userId } = req.query;
    
    if (!userId) {
      throw createError.badRequest('userId is required');
    }

    const conversations = await chatService.getConversations({
      userId: userId as string,
      page: Number(page),
      limit: Number(limit),
    });

    res.json({
      success: true,
      data: conversations,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// 创建新对话
router.post('/conversations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, userId } = req.body;
    
    if (!userId) {
      throw createError.badRequest('userId is required');
    }

    const conversation = await chatService.createConversation({
      title: title || 'New Conversation',
      userId,
    });

    res.status(201).json({
      success: true,
      data: conversation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// 获取对话详情和消息
router.get('/conversations/:conversationId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const conversation = await chatService.getConversationWithMessages({
      conversationId,
      page: Number(page),
      limit: Number(limit),
    });

    if (!conversation) {
      throw createError.notFound('Conversation not found');
    }

    res.json({
      success: true,
      data: conversation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// 发送消息
router.post('/conversations/:conversationId/messages', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const messageData: SendMessageParams = req.body;

    // 验证消息内容或文件至少有一个
    if (!messageData.content?.trim() && (!messageData.files || messageData.files.length === 0)) {
      throw createError.badRequest('Message content or files are required');
    }

    const message = await chatService.sendMessage({
      ...messageData,
      conversationId,
    });

    res.status(201).json({
      success: true,
      data: message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// 获取消息列表
router.get('/conversations/:conversationId/messages', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50, before, after } = req.query;

    const messages = await chatService.getMessages({
      conversationId,
      page: Number(page),
      limit: Number(limit),
      before: before as string,
      after: after as string,
    });

    res.json({
      success: true,
      data: messages,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// 删除对话
router.delete('/conversations/:conversationId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      throw createError.badRequest('userId is required');
    }

    await chatService.deleteConversation({
      conversationId,
      userId: userId as string,
    });

    res.json({
      success: true,
      message: 'Conversation deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export { router as chatRoutes };
