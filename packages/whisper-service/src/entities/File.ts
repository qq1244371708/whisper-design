import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User.js';
import { Message } from './Message.js';

export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  ARCHIVE = 'archive',
  OTHER = 'other',
}

export enum FileStatus {
  UPLOADING = 'uploading',
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
  DELETED = 'deleted',
}

@Entity('files')
@Index(['userId', 'createdAt'])
@Index(['messageId'])
@Index(['type', 'status'])
@Index(['originalName'])
export class File {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '原始文件名',
  })
  originalName!: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '存储文件名',
  })
  filename!: string;

  @Column({
    type: 'varchar',
    length: 500,
    comment: '文件路径',
  })
  path!: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '文件URL',
  })
  url?: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: 'MIME类型',
  })
  mimeType!: string;

  @Column({
    type: 'varchar',
    length: 20,
    comment: '文件类型',
  })
  type!: FileType;

  @Column({
    type: 'bigint',
    comment: '文件大小（字节）',
  })
  size!: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: FileStatus.UPLOADING,
    comment: '文件状态',
  })
  status!: FileStatus;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: true,
    comment: '文件哈希值',
  })
  hash?: string;

  @Column({
    type: 'json',
    nullable: true,
    comment: '文件元数据',
  })
  metadata?: Record<string, any>;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '缩略图路径',
  })
  thumbnailPath?: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '缩略图URL',
  })
  thumbnailUrl?: string;

  @Column({
    type: 'int',
    nullable: true,
    comment: '图片/视频宽度',
  })
  width?: number;

  @Column({
    type: 'int',
    nullable: true,
    comment: '图片/视频高度',
  })
  height?: number;

  @Column({
    type: 'int',
    nullable: true,
    comment: '音频/视频时长（秒）',
  })
  duration?: number;

  @Column({
    type: 'int',
    default: 0,
    comment: '下载次数',
  })
  downloadCount!: number;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: '最后访问时间',
  })
  lastAccessedAt?: Date;

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
    nullable: true,
    comment: '消息ID',
  })
  messageId?: string;

  @ManyToOne(() => User, (user) => user.files, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Message, (message) => message.files, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'messageId' })
  message?: Message;

  // 虚拟字段
  get isImage(): boolean {
    return this.type === FileType.IMAGE;
  }

  get isDocument(): boolean {
    return this.type === FileType.DOCUMENT;
  }

  get isReady(): boolean {
    return this.status === FileStatus.READY;
  }

  get sizeInMB(): number {
    return Math.round((this.size / (1024 * 1024)) * 100) / 100;
  }

  get extension(): string {
    return this.originalName.split('.').pop()?.toLowerCase() || '';
  }

  // 方法
  markAsReady(): void {
    this.status = FileStatus.READY;
    this.updatedAt = new Date();
  }

  markAsFailed(): void {
    this.status = FileStatus.FAILED;
    this.updatedAt = new Date();
  }

  incrementDownloadCount(): void {
    this.downloadCount += 1;
    this.lastAccessedAt = new Date();
  }

  // 根据MIME类型确定文件类型
  static getFileTypeFromMimeType(mimeType: string): FileType {
    if (mimeType.startsWith('image/')) return FileType.IMAGE;
    if (mimeType.startsWith('video/')) return FileType.VIDEO;
    if (mimeType.startsWith('audio/')) return FileType.AUDIO;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) {
      return FileType.ARCHIVE;
    }
    if (
      mimeType.includes('pdf') ||
      mimeType.includes('document') ||
      mimeType.includes('text') ||
      mimeType.includes('spreadsheet') ||
      mimeType.includes('presentation')
    ) {
      return FileType.DOCUMENT;
    }
    return FileType.OTHER;
  }
}
