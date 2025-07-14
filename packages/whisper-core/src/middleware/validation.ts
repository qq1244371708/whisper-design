/**
 * 输入验证中间件
 */

import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => boolean | string;
}

export interface ValidationSchema {
  body?: ValidationRule[];
  query?: ValidationRule[];
  params?: ValidationRule[];
}

export function validate(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    // 验证请求体
    if (schema.body) {
      validateObject(req.body, schema.body, 'body', errors);
    }

    // 验证查询参数
    if (schema.query) {
      validateObject(req.query, schema.query, 'query', errors);
    }

    // 验证路径参数
    if (schema.params) {
      validateObject(req.params, schema.params, 'params', errors);
    }

    if (errors.length > 0) {
      return next(createError.badRequest('Validation failed', { errors }));
    }

    next();
  };
}

function validateObject(
  obj: any,
  rules: ValidationRule[],
  location: string,
  errors: string[]
): void {
  for (const rule of rules) {
    const value = obj[rule.field];
    const fieldPath = `${location}.${rule.field}`;

    // 检查必需字段
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${fieldPath} is required`);
      continue;
    }

    // 如果字段不存在且不是必需的，跳过验证
    if (value === undefined || value === null) {
      continue;
    }

    // 类型验证
    if (rule.type && !validateType(value, rule.type)) {
      errors.push(`${fieldPath} must be of type ${rule.type}`);
      continue;
    }

    // 字符串长度验证
    if (rule.type === 'string' && typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${fieldPath} must be at least ${rule.minLength} characters long`);
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${fieldPath} must be at most ${rule.maxLength} characters long`);
      }
    }

    // 数值范围验证
    if (rule.type === 'number' && typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(`${fieldPath} must be at least ${rule.min}`);
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(`${fieldPath} must be at most ${rule.max}`);
      }
    }

    // 正则表达式验证
    if (rule.pattern && typeof value === 'string') {
      if (!rule.pattern.test(value)) {
        errors.push(`${fieldPath} format is invalid`);
      }
    }

    // 枚举值验证
    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(`${fieldPath} must be one of: ${rule.enum.join(', ')}`);
    }

    // 自定义验证
    if (rule.custom) {
      const result = rule.custom(value);
      if (result !== true) {
        errors.push(typeof result === 'string' ? result : `${fieldPath} is invalid`);
      }
    }
  }
}

function validateType(value: any, type: string): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    default:
      return true;
  }
}

// 常用验证规则
export const commonRules = {
  userId: {
    field: 'userId',
    required: true,
    type: 'string' as const,
    minLength: 1,
    maxLength: 100,
  },
  email: {
    field: 'email',
    type: 'string' as const,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    field: 'password',
    type: 'string' as const,
    minLength: 8,
    maxLength: 128,
  },
  page: {
    field: 'page',
    type: 'number' as const,
    min: 1,
  },
  limit: {
    field: 'limit',
    type: 'number' as const,
    min: 1,
    max: 100,
  },
};

// 数据清理函数
export function sanitizeInput(obj: any): any {
  if (typeof obj === 'string') {
    return obj.trim();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeInput);
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return obj;
}

// 清理中间件
export function sanitize(req: Request, res: Response, next: NextFunction) {
  req.body = sanitizeInput(req.body);
  req.query = sanitizeInput(req.query);
  next();
}
