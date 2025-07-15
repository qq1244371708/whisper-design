import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { UserService } from '../services/UserService.js';
import { UserRole } from '../entities/User.js';

// 扩展Request类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
}

// JWT认证中间件
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
      return;
    }

    // 验证token
    const decoded = jwt.verify(token, config.security.jwtSecret) as any;
    
    // 检查用户是否仍然存在且活跃
    const userService = new UserService();
    const user = await userService.getUserById(decoded.userId);
    
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
      return;
    }

    // 将用户信息添加到请求对象
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

// 可选认证中间件（不强制要求token）
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.security.jwtSecret) as any;
      
      const userService = new UserService();
      const user = await userService.getUserById(decoded.userId);
      
      if (user && user.isActive) {
        req.user = {
          userId: decoded.userId,
          username: decoded.username,
          email: decoded.email,
          role: decoded.role,
        };
      }
    }

    next();
  } catch (error) {
    // 忽略token错误，继续处理请求
    next();
  }
};

// 角色验证中间件
export const requireRole = (roles: UserRole | UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};

// 管理员权限中间件
export const requireAdmin = requireRole(UserRole.ADMIN);

// 管理员或版主权限中间件
export const requireModerator = requireRole([UserRole.ADMIN, UserRole.MODERATOR]);

// 用户所有权验证中间件
export const requireOwnership = (userIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const targetUserId = req.params[userIdParam] || req.body[userIdParam];
    
    // 管理员可以访问任何用户的资源
    if (req.user.role === UserRole.ADMIN) {
      next();
      return;
    }

    // 用户只能访问自己的资源
    if (req.user.userId !== targetUserId) {
      res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own resources',
      });
      return;
    }

    next();
  };
};

// API密钥验证中间件（用于服务间通信）
export const authenticateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    res.status(401).json({
      success: false,
      message: 'API key is required',
    });
    return;
  }

  // 这里可以实现API密钥验证逻辑
  // 目前简单检查是否与配置的密钥匹配
  const validApiKey = process.env.API_KEY || 'whisper-service-api-key';
  
  if (apiKey !== validApiKey) {
    res.status(401).json({
      success: false,
      message: 'Invalid API key',
    });
    return;
  }

  next();
};

// 速率限制中间件（简单实现）
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const identifier = req.ip || 'unknown';
    const now = Date.now();
    
    const userRequests = requestCounts.get(identifier);
    
    if (!userRequests || now > userRequests.resetTime) {
      requestCounts.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      next();
      return;
    }
    
    if (userRequests.count >= maxRequests) {
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
      });
      return;
    }
    
    userRequests.count++;
    next();
  };
};
