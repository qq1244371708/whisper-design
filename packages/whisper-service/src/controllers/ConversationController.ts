import { Request, Response } from 'express';
import { ConversationService } from '../services/ConversationService.js';
import { MessageService } from '../services/MessageService.js';
import { SenderType } from '../entities/Message.js';

export class ConversationController {
  private conversationService: ConversationService;
  private messageService: MessageService;

  constructor() {
    this.conversationService = new ConversationService();
    this.messageService = new MessageService();
  }

  // 获取用户的对话列表
  getConversations = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { page, limit, search, status, pinned, starred } = req.query;

      const options = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
        status: status as any,
        pinned: pinned === 'true' ? true : pinned === 'false' ? false : undefined,
        starred: starred === 'true' ? true : starred === 'false' ? false : undefined,
      };

      const result = await this.conversationService.getUserConversations(userId, options);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get conversations';
      res.status(500).json({
        success: false,
        message,
      });
    }
  };

  // 创建新对话
  createConversation = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { title, description, type } = req.body;

      if (!title) {
        res.status(400).json({
          success: false,
          message: 'Title is required',
        });
        return;
      }

      const conversation = await this.conversationService.createConversation({
        title,
        description,
        type,
        userId,
      });

      res.status(201).json({
        success: true,
        message: 'Conversation created successfully',
        data: conversation,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create conversation';
      res.status(400).json({
        success: false,
        message,
      });
    }
  };

  // 获取单个对话详情
  getConversation = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;
      const conversation = await this.conversationService.getConversationByIdAndUserId(id, userId);

      if (!conversation) {
        res.status(404).json({
          success: false,
          message: 'Conversation not found',
        });
        return;
      }

      res.json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get conversation';
      res.status(500).json({
        success: false,
        message,
      });
    }
  };

  // 更新对话
  updateConversation = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;
      const { title, description, pinned, starred, tags } = req.body;

      // 验证用户是否有权限
      const existingConversation = await this.conversationService.getConversationByIdAndUserId(id, userId);
      if (!existingConversation) {
        res.status(404).json({
          success: false,
          message: 'Conversation not found',
        });
        return;
      }

      const conversation = await this.conversationService.updateConversation(id, {
        title,
        description,
        pinned,
        starred,
        tags,
      });

      res.json({
        success: true,
        message: 'Conversation updated successfully',
        data: conversation,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update conversation';
      res.status(400).json({
        success: false,
        message,
      });
    }
  };

  // 删除对话
  deleteConversation = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;

      // 验证用户是否有权限
      const conversation = await this.conversationService.getConversationByIdAndUserId(id, userId);
      if (!conversation) {
        res.status(404).json({
          success: false,
          message: 'Conversation not found',
        });
        return;
      }

      await this.conversationService.deleteConversation(id);

      res.json({
        success: true,
        message: 'Conversation deleted successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete conversation';
      res.status(400).json({
        success: false,
        message,
      });
    }
  };

  // 获取对话的消息列表
  getConversationMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;
      const { page, limit } = req.query;

      const options = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await this.messageService.getConversationMessages(id, userId, options);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get messages';
      res.status(500).json({
        success: false,
        message,
      });
    }
  };

  // 发送消息
  sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { id: conversationId } = req.params;
      const { content, type, files, sender } = req.body;

      if (!content && (!files || files.length === 0)) {
        res.status(400).json({
          success: false,
          message: 'Content or files are required',
        });
        return;
      }

      // 根据sender参数确定发送者类型
      let senderType = SenderType.USER;
      if (sender === 'ai' || type === 'ai') {
        senderType = SenderType.ASSISTANT;
      }

      const message = await this.messageService.sendMessage({
        content: content || '',
        type,
        senderType,
        conversationId,
        userId,
        senderIp: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      res.status(400).json({
        success: false,
        message,
      });
    }
  };

  // 切换置顶状态
  togglePin = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;
      const conversation = await this.conversationService.togglePin(id, userId);

      res.json({
        success: true,
        message: 'Conversation pin status updated',
        data: conversation,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to toggle pin';
      res.status(400).json({
        success: false,
        message,
      });
    }
  };

  // 切换收藏状态
  toggleStar = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;
      const conversation = await this.conversationService.toggleStar(id, userId);

      res.json({
        success: true,
        message: 'Conversation star status updated',
        data: conversation,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to toggle star';
      res.status(400).json({
        success: false,
        message,
      });
    }
  };
}
