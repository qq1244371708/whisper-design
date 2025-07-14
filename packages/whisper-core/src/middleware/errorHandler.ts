import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export class HttpError extends Error implements ApiError {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(statusCode: number, message: string, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'HTTP_ERROR';
    this.details = details;
    this.name = 'HttpError';
  }
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 如果响应已经发送，交给Express默认错误处理器
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_SERVER_ERROR';
  const message = error.message || 'Internal Server Error';

  // 开发环境显示详细错误信息
  const isDevelopment = process.env.NODE_ENV === 'development';

  const errorResponse = {
    error: {
      code,
      message,
      ...(isDevelopment && { stack: error.stack }),
      ...(error.details && { details: error.details }),
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  };

  // 记录错误日志
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, {
    statusCode,
    code,
    message,
    stack: error.stack,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  res.status(statusCode).json(errorResponse);
};

// 创建常用错误的工厂函数
export const createError = {
  badRequest: (message: string, details?: any) => 
    new HttpError(400, message, 'BAD_REQUEST', details),
  
  unauthorized: (message: string = 'Unauthorized') => 
    new HttpError(401, message, 'UNAUTHORIZED'),
  
  forbidden: (message: string = 'Forbidden') => 
    new HttpError(403, message, 'FORBIDDEN'),
  
  notFound: (message: string = 'Not Found') => 
    new HttpError(404, message, 'NOT_FOUND'),
  
  conflict: (message: string, details?: any) => 
    new HttpError(409, message, 'CONFLICT', details),
  
  unprocessableEntity: (message: string, details?: any) => 
    new HttpError(422, message, 'UNPROCESSABLE_ENTITY', details),
  
  internalServer: (message: string = 'Internal Server Error') => 
    new HttpError(500, message, 'INTERNAL_SERVER_ERROR'),
  
  serviceUnavailable: (message: string = 'Service Unavailable') => 
    new HttpError(503, message, 'SERVICE_UNAVAILABLE'),
};
