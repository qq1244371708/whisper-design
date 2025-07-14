/**
 * 限流中间件
 */

import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';

export interface RateLimitOptions {
  windowMs: number; // 时间窗口（毫秒）
  max: number; // 最大请求数
  message?: string;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private store = new Map<string, RateLimitRecord>();
  private options: Required<RateLimitOptions>;

  constructor(options: RateLimitOptions) {
    this.options = {
      message: 'Too many requests, please try again later',
      keyGenerator: (req) => req.ip || 'unknown',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...options,
    };

    // 定期清理过期记录
    setInterval(() => {
      this.cleanup();
    }, this.options.windowMs);
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = this.options.keyGenerator(req);
      const now = Date.now();
      
      let record = this.store.get(key);
      
      // 如果记录不存在或已过期，创建新记录
      if (!record || now > record.resetTime) {
        record = {
          count: 0,
          resetTime: now + this.options.windowMs,
        };
        this.store.set(key, record);
      }

      // 检查是否超过限制
      if (record.count >= this.options.max) {
        const resetTime = Math.ceil((record.resetTime - now) / 1000);
        
        res.setHeader('X-RateLimit-Limit', this.options.max);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', resetTime);
        
        return next(createError.unprocessableEntity(this.options.message, {
          retryAfter: resetTime,
        }));
      }

      // 增加计数
      record.count++;
      
      // 设置响应头
      res.setHeader('X-RateLimit-Limit', this.options.max);
      res.setHeader('X-RateLimit-Remaining', this.options.max - record.count);
      res.setHeader('X-RateLimit-Reset', Math.ceil((record.resetTime - now) / 1000));

      // 监听响应完成，根据配置决定是否计数
      res.on('finish', () => {
        const statusCode = res.statusCode;
        const isSuccess = statusCode >= 200 && statusCode < 400;
        const isFailed = statusCode >= 400;

        if ((this.options.skipSuccessfulRequests && isSuccess) ||
            (this.options.skipFailedRequests && isFailed)) {
          record!.count--;
        }
      });

      next();
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }

  // 获取统计信息
  getStats() {
    const now = Date.now();
    let activeKeys = 0;
    let totalRequests = 0;

    for (const [key, record] of this.store.entries()) {
      if (now <= record.resetTime) {
        activeKeys++;
        totalRequests += record.count;
      }
    }

    return {
      activeKeys,
      totalRequests,
      storeSize: this.store.size,
      windowMs: this.options.windowMs,
      maxRequests: this.options.max,
    };
  }

  // 重置特定键的限制
  reset(key: string): boolean {
    return this.store.delete(key);
  }

  // 清空所有限制
  clear(): void {
    this.store.clear();
  }
}

// 创建不同类型的限流器
export function createRateLimit(options: RateLimitOptions) {
  const limiter = new RateLimiter(options);
  return limiter.middleware();
}

// 预定义的限流配置
export const rateLimitConfigs = {
  // 严格限流 - 用于敏感操作
  strict: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 10,
    message: 'Too many requests for this operation',
  },
  
  // 标准限流 - 用于一般API
  standard: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100,
    message: 'Too many requests, please try again later',
  },
  
  // 宽松限流 - 用于读取操作
  loose: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 1000,
    message: 'Rate limit exceeded',
  },
  
  // 登录限流 - 防止暴力破解
  auth: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 5,
    message: 'Too many login attempts, please try again later',
    keyGenerator: (req: Request) => `auth:${req.ip}:${req.body?.email || 'unknown'}`,
  },
};

// 全局限流器实例
export const globalRateLimiter = new RateLimiter(rateLimitConfigs.standard);
export const authRateLimiter = new RateLimiter(rateLimitConfigs.auth);
export const strictRateLimiter = new RateLimiter(rateLimitConfigs.strict);
