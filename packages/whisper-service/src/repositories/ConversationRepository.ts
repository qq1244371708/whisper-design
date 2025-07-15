import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database.js';
import { Conversation, ConversationStatus, ConversationType } from '../entities/Conversation.js';

export interface CreateConversationData {
  title: string;
  description?: string;
  type?: ConversationType;
  config?: Record<string, any>;
  metadata?: Record<string, any>;
  userId: string;
}

export interface UpdateConversationData {
  title?: string;
  description?: string;
  config?: Record<string, any>;
  metadata?: Record<string, any>;
  pinned?: boolean;
  starred?: boolean;
  tags?: string;
}

export interface ConversationQueryOptions {
  page?: number;
  limit?: number;
  userId?: string;
  status?: ConversationStatus;
  type?: ConversationType;
  search?: string;
  pinned?: boolean;
  starred?: boolean;
  tags?: string;
}

export class ConversationRepository {
  private repository: Repository<Conversation>;

  constructor() {
    this.repository = AppDataSource.getRepository(Conversation);
  }

  async create(data: CreateConversationData): Promise<Conversation> {
    const conversation = this.repository.create(data);
    return await this.repository.save(conversation);
  }

  async findById(id: string): Promise<Conversation | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['user', 'messages'],
    });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Conversation | null> {
    return await this.repository.findOne({
      where: { id, userId },
      relations: ['user', 'messages'],
    });
  }

  async update(id: string, data: UpdateConversationData): Promise<Conversation | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async updateLastMessage(id: string): Promise<void> {
    await this.repository.update(id, {
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async incrementMessageCount(id: string): Promise<void> {
    await this.repository.increment({ id }, 'messageCount', 1);
    await this.updateLastMessage(id);
  }

  async decrementMessageCount(id: string): Promise<void> {
    await this.repository.decrement({ id }, 'messageCount', 1);
  }

  async archive(id: string): Promise<void> {
    await this.repository.update(id, {
      status: ConversationStatus.ARCHIVED,
    });
  }

  async delete(id: string): Promise<void> {
    await this.repository.update(id, {
      status: ConversationStatus.DELETED,
    });
  }

  async restore(id: string): Promise<void> {
    await this.repository.update(id, {
      status: ConversationStatus.ACTIVE,
    });
  }

  async findMany(options: ConversationQueryOptions = {}): Promise<{
    conversations: Conversation[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 20,
      userId,
      status = ConversationStatus.ACTIVE,
      type,
      search,
      pinned,
      starred,
      tags,
    } = options;

    const queryBuilder = this.repository.createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.user', 'user');

    if (userId) {
      queryBuilder.andWhere('conversation.userId = :userId', { userId });
    }

    if (status) {
      queryBuilder.andWhere('conversation.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('conversation.type = :type', { type });
    }

    if (search) {
      queryBuilder.andWhere(
        '(conversation.title LIKE :search OR conversation.description LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (pinned !== undefined) {
      queryBuilder.andWhere('conversation.pinned = :pinned', { pinned });
    }

    if (starred !== undefined) {
      queryBuilder.andWhere('conversation.starred = :starred', { starred });
    }

    if (tags) {
      queryBuilder.andWhere('conversation.tags LIKE :tags', { tags: `%${tags}%` });
    }

    queryBuilder
      .orderBy('conversation.pinned', 'DESC')
      .addOrderBy('conversation.lastMessageAt', 'DESC')
      .addOrderBy('conversation.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [conversations, total] = await queryBuilder.getManyAndCount();

    return {
      conversations,
      total,
      page,
      limit,
    };
  }

  async findByUserId(userId: string, options: Omit<ConversationQueryOptions, 'userId'> = {}): Promise<{
    conversations: Conversation[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.findMany({ ...options, userId });
  }

  async getStats(userId?: string): Promise<{
    total: number;
    active: number;
    archived: number;
    deleted: number;
    pinned: number;
    starred: number;
  }> {
    const baseWhere = userId ? { userId } : {};

    const [total, active, archived, deleted, pinned, starred] = await Promise.all([
      this.repository.count({ where: baseWhere }),
      this.repository.count({ where: { ...baseWhere, status: ConversationStatus.ACTIVE } }),
      this.repository.count({ where: { ...baseWhere, status: ConversationStatus.ARCHIVED } }),
      this.repository.count({ where: { ...baseWhere, status: ConversationStatus.DELETED } }),
      this.repository.count({ where: { ...baseWhere, pinned: true } }),
      this.repository.count({ where: { ...baseWhere, starred: true } }),
    ]);

    return {
      total,
      active,
      archived,
      deleted,
      pinned,
      starred,
    };
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async existsForUser(id: string, userId: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id, userId } });
    return count > 0;
  }

  async getRecentConversations(userId: string, limit: number = 10): Promise<Conversation[]> {
    return await this.repository.find({
      where: {
        userId,
        status: ConversationStatus.ACTIVE,
      },
      order: {
        lastMessageAt: 'DESC',
        updatedAt: 'DESC',
      },
      take: limit,
      relations: ['user'],
    });
  }
}
