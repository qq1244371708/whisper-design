import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository, CreateUserData, UpdateUserData, UserQueryOptions } from '../repositories/UserRepository.js';
import { User, UserRole } from '../entities/User.js';
import { config } from '../config/index.js';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginData {
  emailOrUsername: string;
  password: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface JwtPayload {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
}

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: RegisterData): Promise<AuthResult> {
    const { username, email, password, displayName } = data;

    // 检查用户名和邮箱是否已存在
    const existingUser = await this.userRepository.findByEmailOrUsername(email);
    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error('Email already exists');
      }
      if (existingUser.username === username) {
        throw new Error('Username already exists');
      }
    }

    // 检查用户名是否已被使用
    const existingUsername = await this.userRepository.findByUsername(username);
    if (existingUsername) {
      throw new Error('Username already exists');
    }

    // 哈希密码
    const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds);

    // 创建用户
    const createData: CreateUserData = {
      username,
      email,
      passwordHash,
      displayName: displayName || username,
    };

    const user = await this.userRepository.create(createData);

    // 生成JWT token
    const token = this.generateToken(user);

    return { user, token };
  }

  async login(data: LoginData, ip?: string): Promise<AuthResult> {
    const { emailOrUsername, password } = data;

    // 查找用户
    const user = await this.userRepository.findByEmailOrUsername(emailOrUsername);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // 检查用户状态
    if (!user.isActive) {
      throw new Error('Account is not active');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // 更新最后登录信息
    await this.userRepository.updateLastLogin(user.id, ip);

    // 生成JWT token
    const token = this.generateToken(user);

    return { user, token };
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findByUsername(username);
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return await this.userRepository.update(id, data);
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // 哈希新密码
    const newPasswordHash = await bcrypt.hash(newPassword, config.security.bcryptRounds);

    // 更新密码
    await this.userRepository.update(id, { passwordHash: newPasswordHash } as any);
  }

  async verifyEmail(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.verifyEmail(id);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.delete(id);
  }

  async getUsers(options: UserQueryOptions = {}) {
    return await this.userRepository.findMany(options);
  }

  async getUserStats() {
    return await this.userRepository.getStats();
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, config.security.jwtSecret) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async refreshToken(token: string): Promise<string> {
    const decoded = await this.verifyToken(token);
    const user = await this.userRepository.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    return this.generateToken(user);
  }

  private generateToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, config.security.jwtSecret, {
      expiresIn: config.security.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  async isEmailAvailable(email: string, excludeUserId?: string): Promise<boolean> {
    return !(await this.userRepository.isEmailTaken(email, excludeUserId));
  }

  async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    return !(await this.userRepository.isUsernameTaken(username, excludeUserId));
  }
}
