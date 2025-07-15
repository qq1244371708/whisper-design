import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User.js';
import { Message } from './Message.js';

export enum ConversationStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export enum ConversationType {
  CHAT = 'chat',
  ASSISTANT = 'assistant',
  GROUP = 'group',
}

@Entity('conversations')
@Index(['userId', 'status'])
@Index(['createdAt'])
@Index(['updatedAt'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 200,
    comment: '对话标题',
  })
  title!: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '对话描述',
  })
  description?: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: ConversationType.CHAT,
    comment: '对话类型',
  })
  type!: ConversationType;

  @Column({
    type: 'varchar',
    length: 20,
    default: ConversationStatus.ACTIVE,
    comment: '对话状态',
  })
  status!: ConversationStatus;

  @Column({
    type: 'json',
    nullable: true,
    comment: '对话配置',
  })
  config?: Record<string, any>;

  @Column({
    type: 'json',
    nullable: true,
    comment: '对话元数据',
  })
  metadata?: Record<string, any>;

  @Column({
    type: 'int',
    default: 0,
    comment: '消息数量',
  })
  messageCount!: number;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: '最后消息时间',
  })
  lastMessageAt?: Date;

  @Column({
    type: 'boolean',
    default: false,
    comment: '是否置顶',
  })
  pinned!: boolean;

  @Column({
    type: 'boolean',
    default: false,
    comment: '是否收藏',
  })
  starred!: boolean;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '标签',
  })
  tags?: string;

  @CreateDateColumn({
    type: 'datetime',
    comment: '创建时间',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'datetime',
    comment: '更新时间',
  })
  updatedAt!: Date;

  // 外键关系
  @Column({
    type: 'varchar',
    length: 36,
    comment: '用户ID',
  })
  userId!: string;

  @ManyToOne(() => User, (user) => user.conversations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @OneToMany(() => Message, (message) => message.conversation, {
    cascade: true,
  })
  messages!: Message[];

  // 虚拟字段
  get isActive(): boolean {
    return this.status === ConversationStatus.ACTIVE;
  }

  get isArchived(): boolean {
    return this.status === ConversationStatus.ARCHIVED;
  }

  get isDeleted(): boolean {
    return this.status === ConversationStatus.DELETED;
  }

  // 方法
  updateLastMessage(): void {
    this.lastMessageAt = new Date();
    this.updatedAt = new Date();
  }

  incrementMessageCount(): void {
    this.messageCount += 1;
  }

  decrementMessageCount(): void {
    if (this.messageCount > 0) {
      this.messageCount -= 1;
    }
  }
}
