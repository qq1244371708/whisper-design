import { Router } from 'express';
import { chatRoutes } from './chat';
import { userRoutes } from './user';
import { fileRoutes } from './file';
import { proxyRoutes } from './proxy';
import { ssrRoutes } from './ssr';

const router: Router = Router();

// API版本信息
router.get('/', (req, res) => {
  res.json({
    service: 'whisper-core',
    version: '0.1.0',
    description: 'BFF layer for Whisper Design',
    endpoints: {
      chat: '/api/chat',
      users: '/api/users',
      files: '/api/files',
      proxy: '/api/proxy',
      ssr: '/api/ssr',
    },
    timestamp: new Date().toISOString(),
  });
});

// 注册各个模块的路由
router.use('/chat', chatRoutes);
router.use('/users', userRoutes);
router.use('/files', fileRoutes);
router.use('/proxy', proxyRoutes);
router.use('/ssr', ssrRoutes);

export { router as apiRoutes };
