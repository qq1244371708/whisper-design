import { MessageRepository, CreateMessageData, UpdateMessageData, MessageQueryOptions } from '../repositories/MessageRepository.js';
import { ConversationRepository } from '../repositories/ConversationRepository.js';
import { Message, MessageType, SenderType } from '../entities/Message.js';

export class MessageService {
  private messageRepository: MessageRepository;
  private conversationRepository: ConversationRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
    this.conversationRepository = new ConversationRepository();
  }

  async sendMessage(data: CreateMessageData): Promise<Message> {
    // 验证对话是否存在且用户有权限
    const conversation = await this.conversationRepository.findByIdAndUserId(
      data.conversationId,
      data.userId
    );
    
    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    // 创建消息
    const message = await this.messageRepository.create(data);

    // 更新对话的最后消息时间和消息计数
    await this.conversationRepository.incrementMessageCount(data.conversationId);
    await this.conversationRepository.updateLastMessage(data.conversationId);

    return message;
  }

  async getMessageById(id: string): Promise<Message | null> {
    return await this.messageRepository.findById(id);
  }

  async getMessageByIdAndUserId(id: string, userId: string): Promise<Message | null> {
    return await this.messageRepository.findByIdAndUserId(id, userId);
  }

  async updateMessage(id: string, userId: string, data: UpdateMessageData): Promise<Message | null> {
    // 验证消息是否存在且用户有权限
    const message = await this.messageRepository.findByIdAndUserId(id, userId);
    if (!message) {
      throw new Error('Message not found or access denied');
    }

    // 如果更新了内容，标记为已编辑
    if (data.content && data.content !== message.content) {
      data.edited = true;
      data.editedAt = new Date();
    }

    return await this.messageRepository.update(id, data);
  }

  async deleteMessage(id: string, userId: string): Promise<void> {
    // 验证消息是否存在且用户有权限
    const message = await this.messageRepository.findByIdAndUserId(id, userId);
    if (!message) {
      throw new Error('Message not found or access denied');
    }

    await this.messageRepository.delete(id);

    // 更新对话的消息计数
    await this.conversationRepository.decrementMessageCount(message.conversationId);
  }

  async getMessages(options: MessageQueryOptions = {}) {
    return await this.messageRepository.findMany(options);
  }

  async getConversationMessages(conversationId: string, userId: string, options: {
    page?: number;
    limit?: number;
  } = {}) {
    // 验证用户是否有权限访问这个对话
    const conversation = await this.conversationRepository.findByIdAndUserId(conversationId, userId);
    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    return await this.messageRepository.findByConversationId(conversationId, options);
  }

  async getUserMessages(userId: string, options: {
    page?: number;
    limit?: number;
    conversationId?: string;
    type?: MessageType;
    search?: string;
  } = {}) {
    return await this.messageRepository.findMany({
      ...options,
      userId,
    });
  }

  async getMessageStats(conversationId?: string, userId?: string) {
    return await this.messageRepository.getStats(conversationId, userId);
  }

  async getLatestMessages(conversationId: string, userId: string, limit: number = 10): Promise<Message[]> {
    // 验证用户是否有权限访问这个对话
    const conversation = await this.conversationRepository.findByIdAndUserId(conversationId, userId);
    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    return await this.messageRepository.getLatestMessages(conversationId, limit);
  }

  async markMessagesAsRead(messageIds: string[], userId: string): Promise<void> {
    // 验证所有消息都属于该用户或该用户有权限访问
    for (const messageId of messageIds) {
      const message = await this.messageRepository.findById(messageId);
      if (!message) {
        continue; // 跳过不存在的消息
      }

      // 检查用户是否有权限访问这个对话
      const hasAccess = await this.conversationRepository.existsForUser(
        message.conversationId,
        userId
      );
      
      if (!hasAccess) {
        throw new Error(`Access denied to message ${messageId}`);
      }
    }

    await this.messageRepository.markAsRead(messageIds);
  }

  async likeMessage(id: string, userId: string): Promise<Message> {
    // 验证消息是否存在且用户有权限访问
    const message = await this.messageRepository.findById(id);
    if (!message) {
      throw new Error('Message not found');
    }

    // 检查用户是否有权限访问这个对话
    const hasAccess = await this.conversationRepository.existsForUser(
      message.conversationId,
      userId
    );
    
    if (!hasAccess) {
      throw new Error('Access denied');
    }

    await this.messageRepository.incrementLikes(id);
    
    const updatedMessage = await this.messageRepository.findById(id);
    if (!updatedMessage) {
      throw new Error('Failed to get updated message');
    }

    return updatedMessage;
  }

  async unlikeMessage(id: string, userId: string): Promise<Message> {
    // 验证消息是否存在且用户有权限访问
    const message = await this.messageRepository.findById(id);
    if (!message) {
      throw new Error('Message not found');
    }

    // 检查用户是否有权限访问这个对话
    const hasAccess = await this.conversationRepository.existsForUser(
      message.conversationId,
      userId
    );
    
    if (!hasAccess) {
      throw new Error('Access denied');
    }

    await this.messageRepository.decrementLikes(id);
    
    const updatedMessage = await this.messageRepository.findById(id);
    if (!updatedMessage) {
      throw new Error('Failed to get updated message');
    }

    return updatedMessage;
  }

  async searchMessages(userId: string, query: string, options: {
    page?: number;
    limit?: number;
    conversationId?: string;
  } = {}) {
    return await this.messageRepository.findMany({
      ...options,
      userId,
      search: query,
    });
  }

  async messageExists(id: string): Promise<boolean> {
    return await this.messageRepository.exists(id);
  }

  async messageExistsForUser(id: string, userId: string): Promise<boolean> {
    return await this.messageRepository.existsForUser(id, userId);
  }

  // AI助手回复消息
  async sendAIReply(conversationId: string, content: string, replyToId?: string): Promise<Message> {
    // 验证对话是否存在
    const conversation = await this.conversationRepository.findById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const messageData: CreateMessageData = {
      content,
      type: MessageType.AI,
      senderType: SenderType.ASSISTANT,
      conversationId,
      userId: conversation.userId, // AI消息关联到对话的所有者
      replyToId,
    };

    return await this.sendMessage(messageData);
  }

  // 系统消息
  async sendSystemMessage(conversationId: string, content: string): Promise<Message> {
    // 验证对话是否存在
    const conversation = await this.conversationRepository.findById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const messageData: CreateMessageData = {
      content,
      type: MessageType.SYSTEM,
      senderType: SenderType.SYSTEM,
      conversationId,
      userId: conversation.userId, // 系统消息关联到对话的所有者
    };

    return await this.sendMessage(messageData);
  }
}
