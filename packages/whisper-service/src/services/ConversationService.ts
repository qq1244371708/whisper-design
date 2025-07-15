import { ConversationRepository, CreateConversationData, UpdateConversationData, ConversationQueryOptions } from '../repositories/ConversationRepository.js';
import { MessageRepository } from '../repositories/MessageRepository.js';
import { Conversation, ConversationStatus } from '../entities/Conversation.js';

export class ConversationService {
  private conversationRepository: ConversationRepository;
  private messageRepository: MessageRepository;

  constructor() {
    this.conversationRepository = new ConversationRepository();
    this.messageRepository = new MessageRepository();
  }

  async createConversation(data: CreateConversationData): Promise<Conversation> {
    return await this.conversationRepository.create(data);
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    return await this.conversationRepository.findById(id);
  }

  async getConversationByIdAndUserId(id: string, userId: string): Promise<Conversation | null> {
    return await this.conversationRepository.findByIdAndUserId(id, userId);
  }

  async updateConversation(id: string, data: UpdateConversationData): Promise<Conversation | null> {
    const conversation = await this.conversationRepository.findById(id);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return await this.conversationRepository.update(id, data);
  }

  async deleteConversation(id: string): Promise<void> {
    const conversation = await this.conversationRepository.findById(id);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    await this.conversationRepository.delete(id);
  }

  async archiveConversation(id: string): Promise<void> {
    const conversation = await this.conversationRepository.findById(id);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    await this.conversationRepository.archive(id);
  }

  async restoreConversation(id: string): Promise<void> {
    const conversation = await this.conversationRepository.findById(id);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    await this.conversationRepository.restore(id);
  }

  async getConversations(options: ConversationQueryOptions = {}) {
    return await this.conversationRepository.findMany(options);
  }

  async getUserConversations(userId: string, options: Omit<ConversationQueryOptions, 'userId'> = {}) {
    return await this.conversationRepository.findByUserId(userId, options);
  }

  async getConversationStats(userId?: string) {
    return await this.conversationRepository.getStats(userId);
  }

  async getRecentConversations(userId: string, limit: number = 10): Promise<Conversation[]> {
    return await this.conversationRepository.getRecentConversations(userId, limit);
  }

  async conversationExists(id: string): Promise<boolean> {
    return await this.conversationRepository.exists(id);
  }

  async conversationExistsForUser(id: string, userId: string): Promise<boolean> {
    return await this.conversationRepository.existsForUser(id, userId);
  }

  async getConversationWithMessages(id: string, userId: string, messageOptions?: {
    page?: number;
    limit?: number;
  }) {
    // 验证用户是否有权限访问这个对话
    const conversation = await this.conversationRepository.findByIdAndUserId(id, userId);
    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    // 获取对话的消息
    const messagesResult = await this.messageRepository.findByConversationId(id, messageOptions);

    return {
      conversation,
      messages: messagesResult.messages,
      pagination: {
        total: messagesResult.total,
        page: messagesResult.page,
        limit: messagesResult.limit,
      },
    };
  }

  async updateLastMessage(conversationId: string): Promise<void> {
    await this.conversationRepository.updateLastMessage(conversationId);
  }

  async incrementMessageCount(conversationId: string): Promise<void> {
    await this.conversationRepository.incrementMessageCount(conversationId);
  }

  async decrementMessageCount(conversationId: string): Promise<void> {
    await this.conversationRepository.decrementMessageCount(conversationId);
  }

  async searchConversations(userId: string, query: string, options: {
    page?: number;
    limit?: number;
  } = {}) {
    return await this.conversationRepository.findMany({
      ...options,
      userId,
      search: query,
    });
  }

  async getConversationsByStatus(userId: string, status: ConversationStatus, options: {
    page?: number;
    limit?: number;
  } = {}) {
    return await this.conversationRepository.findMany({
      ...options,
      userId,
      status,
    });
  }

  async togglePin(id: string, userId: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findByIdAndUserId(id, userId);
    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    const updated = await this.conversationRepository.update(id, {
      pinned: !conversation.pinned,
    });

    if (!updated) {
      throw new Error('Failed to update conversation');
    }

    return updated;
  }

  async toggleStar(id: string, userId: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findByIdAndUserId(id, userId);
    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    const updated = await this.conversationRepository.update(id, {
      starred: !conversation.starred,
    });

    if (!updated) {
      throw new Error('Failed to update conversation');
    }

    return updated;
  }

  async updateTags(id: string, userId: string, tags: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findByIdAndUserId(id, userId);
    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    const updated = await this.conversationRepository.update(id, { tags });

    if (!updated) {
      throw new Error('Failed to update conversation');
    }

    return updated;
  }
}
