import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config, validateConfig } from './config/index.js';
import { initializeDatabase } from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';

// 验证配置
validateConfig();

const app: Express = express();

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS配置
app.use(cors({
  origin: config.server.cors.origin,
  credentials: config.server.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));

// 压缩响应
app.use(compression());

// 请求日志
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 信任代理（用于获取真实IP）
app.set('trust proxy', 1);

// 健康检查端点
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API信息端点
app.get('/api', (_req, res) => {
  res.json({
    name: 'Whisper Design Data Service',
    version: process.env.npm_package_version || '1.0.0',
    description: 'Data service layer for Whisper Design application',
    environment: config.env,
    endpoints: {
      users: '/api/users',
      conversations: '/api/conversations',
      messages: '/api/messages',
      files: '/api/files',
    },
    documentation: '/api/docs',
  });
});

// API路由
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// 全局错误处理中间件
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);

  // 数据库错误
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry error',
      error: config.env === 'development' ? err.message : undefined,
    });
  }

  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
  }

  // 验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.details || err.message,
    });
  }

  // 默认错误
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: config.env === 'development' ? err.stack : undefined,
  });
});

// 初始化数据库并启动服务器
const startServer = async () => {
  try {
    console.log('🚀 Starting server initialization...');

    // 初始化数据库连接
    console.log('📊 About to initialize database...');
    await initializeDatabase();
    console.log('✅ Database initialized successfully');

    // 启动服务器
    const server = app.listen(config.server.port, config.server.host, () => {
      console.log(`🚀 Whisper Design Data Service is running on ${config.server.host}:${config.server.port}`);
      console.log(`🌍 Environment: ${config.env}`);
      console.log(`📚 API Documentation: http://${config.server.host}:${config.server.port}/api`);
      console.log(`❤️  Health Check: http://${config.server.host}:${config.server.port}/health`);
    });

    // 优雅关闭
    const gracefulShutdown = (signal: string) => {
      console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('🔌 HTTP server closed');
        
        try {
          // 关闭数据库连接
          const { closeDatabase } = await import('./config/database.js');
          await closeDatabase();
          console.log('🗄️  Database connection closed');
          
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    // 监听关闭信号
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// 启动服务器
startServer();

export default app;
