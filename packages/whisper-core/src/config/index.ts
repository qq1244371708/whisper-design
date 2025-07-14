import dotenv from 'dotenv';
import { validateEnvironment, getEnvValue } from './validation';

// 首先加载环境变量
dotenv.config();

// 然后验证环境变量
validateEnvironment();

export const config = {
  // 服务器配置
  server: {
    port: 3001,
    host: '0.0.0.0',
    env: process.env.NODE_ENV || 'development',
  },

  // CORS配置
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowedOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',')
        : [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:5174',
          ];

      // 允许没有origin的请求（如Postman、curl等）
      if (!origin) return callback(null, true);

      // 检查origin是否在允许列表中
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'] as string[],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'] as string[],
  },

  // API配置
  api: {
    prefix: '/api',
    version: 'v1',
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 100, // 限制每个IP 15分钟内最多100个请求
    },
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
  },

  // 数据服务配置（为Phase 3准备）
  dataService: {
    baseUrl: process.env.DATA_SERVICE_URL || 'http://localhost:3002',
    timeout: 5000,
    retries: 3,
  },

  // 缓存配置
  cache: {
    ttl: 300, // 5分钟
    maxSize: 100,
  },

  // SSR配置（预留）
  ssr: {
    enabled: process.env.SSR_ENABLED === 'true',
    cacheEnabled: true,
    cacheTtl: 600, // 10分钟
  },

  // JWT配置（为认证准备）
  jwt: {
    secret: getEnvValue('JWT_SECRET'),
    expiresIn: '24h',
    issuer: 'whisper-core',
  },
} as const;

export type Config = typeof config;
