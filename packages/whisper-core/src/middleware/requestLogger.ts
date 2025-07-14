import { Request, Response, NextFunction } from 'express';

export interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
  ip: string;
  requestId: string;
}

// 生成请求ID
const generateRequestId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  // 将请求ID添加到请求对象中，方便后续使用
  (req as any).requestId = requestId;
  
  // 添加请求ID到响应头
  res.setHeader('X-Request-ID', requestId);

  const logEntry: Partial<LogEntry> = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    requestId,
  };

  // 记录请求开始
  console.log(`[REQUEST] ${requestId} ${req.method} ${req.originalUrl}`, {
    ...logEntry,
    headers: filterSensitiveHeaders(req.headers),
    query: req.query,
    body: filterSensitiveBody(req.body),
  });

  // 监听响应完成
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const completeLogEntry: LogEntry = {
      ...logEntry as LogEntry,
      statusCode: res.statusCode,
      responseTime,
    };

    const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    console.log(`[RESPONSE] ${requestId} ${res.statusCode} ${responseTime}ms`, completeLogEntry);
  });

  next();
};

// 过滤敏感请求头
const filterSensitiveHeaders = (headers: any) => {
  const filtered = { ...headers };
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  
  sensitiveHeaders.forEach(header => {
    if (filtered[header]) {
      filtered[header] = '[FILTERED]';
    }
  });
  
  return filtered;
};

// 过滤敏感请求体数据
const filterSensitiveBody = (body: any) => {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const filtered = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'key'];
  
  sensitiveFields.forEach(field => {
    if (filtered[field]) {
      filtered[field] = '[FILTERED]';
    }
  });
  
  return filtered;
};

// 异步请求日志记录器（用于记录到外部日志服务）
export const asyncLogger = {
  info: (message: string, data?: any) => {
    // 这里可以集成外部日志服务，如 Winston, Bunyan 等
    console.log(`[INFO] ${message}`, data);
  },
  
  error: (message: string, error?: Error, data?: any) => {
    console.error(`[ERROR] ${message}`, { error: error?.message, stack: error?.stack, ...data });
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },
  
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data);
    }
  },
};
