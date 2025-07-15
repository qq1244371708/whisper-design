import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database.js';
import { Message, MessageType, MessageStatus, SenderType } from '../entities/Message.js';

export interface CreateMessageData {
  content: string;
  type?: MessageType;
  senderType: SenderType;
  status?: MessageStatus;
  metadata?: Record<string, any>;
  replyToId?: string;
  senderIp?: string;
  userAgent?: string;
  userId: string;
  conversationId: string;
}

export interface UpdateMessageData {
  content?: string;
  metadata?: Record<string, any>;
  pinned?: boolean;
  edited?: boolean;
  editedAt?: Date;
}

export interface MessageQueryOptions {
  page?: number;
  limit?: number;
  conversationId?: string;
  userId?: string;
  type?: MessageType;
  status?: MessageStatus;
  senderType?: SenderType;
  search?: string;
}

export class MessageRepository {
  private repository: Repository<Message>;

  constructor() {
    this.repository = AppDataSource.getRepository(Message);
  }

  async create(data: CreateMessageData): Promise<Message> {
    const message = this.repository.create(data);
    return await this.repository.save(message);
  }

  async findById(id: string): Promise<Message | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['user', 'conversation', 'files', 'replyTo'],
    });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Message | null> {
    return await this.repository.findOne({
      where: { id, userId },
      relations: ['user', 'conversation', 'files', 'replyTo'],
    });
  }

  async update(id: string, data: UpdateMessageData): Promise<Message | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.update(id, {
      status: MessageStatus.DELETED,
    });
  }

  async findMany(options: MessageQueryOptions = {}): Promise<{
    messages: Message[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 20,
      conversationId,
      userId,
      type,
      status,
      senderType,
      search,
    } = options;

    const queryBuilder = this.repository.createQueryBuilder('message')
      .leftJoinAndSelect('message.user', 'user')
      .leftJoinAndSelect('message.conversation', 'conversation')
      .leftJoinAndSelect('message.files', 'files')
      .leftJoinAndSelect('message.replyTo', 'replyTo');

    if (conversationId) {
      queryBuilder.andWhere('message.conversationId = :conversationId', { conversationId });
    }

    if (userId) {
      queryBuilder.andWhere('message.userId = :userId', { userId });
    }

    if (type) {
      queryBuilder.andWhere('message.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('message.status = :status', { status });
    } else {
      // 默认不显示已删除的消息
      queryBuilder.andWhere('message.status != :deletedStatus', { deletedStatus: MessageStatus.DELETED });
    }

    if (senderType) {
      queryBuilder.andWhere('message.senderType = :senderType', { senderType });
    }

    if (search) {
      queryBuilder.andWhere('message.content LIKE :search', { search: `%${search}%` });
    }

    queryBuilder
      .orderBy('message.createdAt', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [messages, total] = await queryBuilder.getManyAndCount();

    return {
      messages,
      total,
      page,
      limit,
    };
  }

  async findByConversationId(conversationId: string, options: Omit<MessageQueryOptions, 'conversationId'> = {}): Promise<{
    messages: Message[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.findMany({ ...options, conversationId });
  }

  async getStats(conversationId?: string, userId?: string): Promise<{
    total: number;
    text: number;
    image: number;
    file: number;
    system: number;
    ai: number;
  }> {
    const baseWhere: any = { status: MessageStatus.SENT };
    
    if (conversationId) {
      baseWhere.conversationId = conversationId;
    }
    
    if (userId) {
      baseWhere.userId = userId;
    }

    const [total, text, image, file, system, ai] = await Promise.all([
      this.repository.count({ where: baseWhere }),
      this.repository.count({ where: { ...baseWhere, type: MessageType.TEXT } }),
      this.repository.count({ where: { ...baseWhere, type: MessageType.IMAGE } }),
      this.repository.count({ where: { ...baseWhere, type: MessageType.FILE } }),
      this.repository.count({ where: { ...baseWhere, type: MessageType.SYSTEM } }),
      this.repository.count({ where: { ...baseWhere, type: MessageType.AI } }),
    ]);

    return {
      total,
      text,
      image,
      file,
      system,
      ai,
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

  async getLatestMessages(conversationId: string, limit: number = 10): Promise<Message[]> {
    return await this.repository.find({
      where: {
        conversationId,
        status: MessageStatus.SENT,
      },
      order: {
        createdAt: 'DESC',
      },
      take: limit,
      relations: ['user', 'files'],
    });
  }

  async markAsRead(messageIds: string[]): Promise<void> {
    await this.repository.createQueryBuilder()
      .update(Message)
      .set({ status: MessageStatus.READ })
      .where('id IN (:...ids)', { ids: messageIds })
      .execute();
  }

  async incrementLikes(id: string): Promise<void> {
    await this.repository.increment({ id }, 'likeCount', 1);
  }

  async decrementLikes(id: string): Promise<void> {
    await this.repository.decrement({ id }, 'likeCount', 1);
  }
}
