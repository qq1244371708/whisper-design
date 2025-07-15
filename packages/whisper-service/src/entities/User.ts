import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Conversation } from './Conversation.js';
import { Message } from './Message.js';
import { File } from './File.js';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: '用户名',
  })
  username!: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    comment: '邮箱地址',
  })
  email!: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '密码哈希',
  })
  passwordHash!: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '显示名称',
  })
  displayName?: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '头像URL',
  })
  avatar?: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: UserRole.USER,
    comment: '用户角色',
  })
  role!: UserRole;

  @Column({
    type: 'varchar',
    length: 20,
    default: UserStatus.ACTIVE,
    comment: '用户状态',
  })
  status!: UserStatus;

  @Column({
    type: 'json',
    nullable: true,
    comment: '用户偏好设置',
  })
  preferences?: Record<string, any>;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: '最后登录时间',
  })
  lastLoginAt?: Date;

  @Column({
    type: 'varchar',
    length: 45,
    nullable: true,
    comment: '最后登录IP',
  })
  lastLoginIp?: string;

  @Column({
    type: 'boolean',
    default: false,
    comment: '邮箱是否已验证',
  })
  emailVerified!: boolean;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: '邮箱验证时间',
  })
  emailVerifiedAt?: Date;

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

  // 关联关系
  @OneToMany(() => Conversation, (conversation) => conversation.user)
  conversations!: Conversation[];

  @OneToMany(() => Message, (message) => message.user)
  messages!: Message[];

  @OneToMany(() => File, (file) => file.user)
  files!: File[];

  // 虚拟字段
  get isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  get isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  // 方法
  toJSON() {
    const { passwordHash, ...result } = this;
    return result;
  }
}
