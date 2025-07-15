import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database.js';
import { User, UserStatus } from '../entities/User.js';

export interface CreateUserData {
  username: string;
  email: string;
  passwordHash: string;
  displayName?: string;
  avatar?: string;
}

export interface UpdateUserData {
  displayName?: string;
  avatar?: string;
  preferences?: Record<string, any>;
  status?: UserStatus;
}

export interface UserQueryOptions {
  page?: number;
  limit?: number;
  status?: UserStatus;
  search?: string;
}

export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async create(data: CreateUserData): Promise<User> {
    const user = this.repository.create(data);
    return await this.repository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['conversations', 'messages', 'files'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { username },
    });
  }

  async findByEmailOrUsername(emailOrUsername: string): Promise<User | null> {
    return await this.repository.findOne({
      where: [
        { email: emailOrUsername },
        { username: emailOrUsername },
      ],
    });
  }

  async update(id: string, data: UpdateUserData): Promise<User | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async updateLastLogin(id: string, ip?: string): Promise<void> {
    await this.repository.update(id, {
      lastLoginAt: new Date(),
      lastLoginIp: ip,
    });
  }

  async verifyEmail(id: string): Promise<void> {
    await this.repository.update(id, {
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });
  }

  async delete(id: string): Promise<void> {
    await this.repository.update(id, {
      status: UserStatus.DELETED,
    });
  }

  async findMany(options: UserQueryOptions = {}): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 20,
      status,
      search,
    } = options;

    const queryBuilder = this.repository.createQueryBuilder('user');

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.username LIKE :search OR user.email LIKE :search OR user.displayName LIKE :search)',
        { search: `%${search}%` }
      );
    }

    queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      users,
      total,
      page,
      limit,
    };
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    deleted: number;
  }> {
    const [total, active, inactive, suspended, deleted] = await Promise.all([
      this.repository.count(),
      this.repository.count({ where: { status: UserStatus.ACTIVE } }),
      this.repository.count({ where: { status: UserStatus.INACTIVE } }),
      this.repository.count({ where: { status: UserStatus.SUSPENDED } }),
      this.repository.count({ where: { status: UserStatus.DELETED } }),
    ]);

    return {
      total,
      active,
      inactive,
      suspended,
      deleted,
    };
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async isEmailTaken(email: string, excludeId?: string): Promise<boolean> {
    const queryBuilder = this.repository.createQueryBuilder('user')
      .where('user.email = :email', { email });

    if (excludeId) {
      queryBuilder.andWhere('user.id != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  async isUsernameTaken(username: string, excludeId?: string): Promise<boolean> {
    const queryBuilder = this.repository.createQueryBuilder('user')
      .where('user.username = :username', { username });

    if (excludeId) {
      queryBuilder.andWhere('user.id != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }
}
