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
import { Conversation } from './Conversation.js';
import { File } from './File.js';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
  AI = 'ai',
}

export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  DELETED = 'deleted',
}

export enum SenderType {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

@Entity('messages')
@Index(['conversationId', 'createdAt'])
@Index(['userId', 'createdAt'])
@Index(['type', 'status'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'text',
    comment: '消息内容',
  })
  content!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: MessageType.TEXT,
    comment: '消息类型',
  })
  type!: MessageType;

  @Column({
    type: 'varchar',
    length: 20,
    comment: '发送者类型',
  })
  senderType!: SenderType;

  @Column({
    type: 'varchar',
    length: 20,
    default: MessageStatus.SENT,
    comment: '消息状态',
  })
  status!: MessageStatus;

  @Column({
    type: 'json',
    nullable: true,
    comment: '消息元数据',
  })
  metadata?: Record<string, any>;

  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '回复的消息ID',
  })
  replyToId?: string;

  @Column({
    type: 'boolean',
    default: false,
    comment: '是否已编辑',
  })
  edited!: boolean;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: '编辑时间',
  })
  editedAt?: Date;

  @Column({
    type: 'boolean',
    default: false,
    comment: '是否置顶',
  })
  pinned!: boolean;

  @Column({
    type: 'int',
    default: 0,
    comment: '点赞数',
  })
  likeCount!: number;

  @Column({
    type: 'varchar',
    length: 45,
    nullable: true,
    comment: '发送者IP',
  })
  senderIp?: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '用户代理',
  })
  userAgent?: string;

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

  @Column({
    type: 'varchar',
    length: 36,
    comment: '对话ID',
  })
  conversationId!: string;

  @ManyToOne(() => User, (user) => user.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversationId' })
  conversation!: Conversation;

  @OneToMany(() => File, (file) => file.message)
  files!: File[];

  // 自引用关系 - 回复消息
  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'replyToId' })
  replyTo?: Message;

  // 虚拟字段
  get isFromUser(): boolean {
    return this.senderType === SenderType.USER;
  }

  get isFromAssistant(): boolean {
    return this.senderType === SenderType.ASSISTANT;
  }

  get isSystemMessage(): boolean {
    return this.senderType === SenderType.SYSTEM;
  }

  get hasFiles(): boolean {
    return this.files && this.files.length > 0;
  }

  // 方法
  markAsRead(): void {
    this.status = MessageStatus.READ;
    this.updatedAt = new Date();
  }

  markAsEdited(): void {
    this.edited = true;
    this.editedAt = new Date();
    this.updatedAt = new Date();
  }

  incrementLikes(): void {
    this.likeCount += 1;
  }

  decrementLikes(): void {
    if (this.likeCount > 0) {
      this.likeCount -= 1;
    }
  }
}
