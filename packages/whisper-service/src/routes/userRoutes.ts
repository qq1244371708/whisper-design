import { Router, type IRouter } from 'express';
import { UserController } from '../controllers/UserController.js';
import { authenticateToken, requireAdmin, rateLimit } from '../middleware/auth.js';
import { validate } from '../validators/userValidator.js';
import { registerSchema, loginSchema, updateUserSchema, changePasswordSchema } from '../validators/userValidator.js';

const router: IRouter = Router();
const userController = new UserController();

// 公开路由
router.post('/register', 
  rateLimit(5, 15 * 60 * 1000), // 15分钟内最多5次注册请求
  validate(registerSchema),
  userController.register
);

router.post('/login',
  rateLimit(10, 15 * 60 * 1000), // 15分钟内最多10次登录请求
  validate(loginSchema),
  userController.login
);

router.post('/refresh-token',
  rateLimit(20, 15 * 60 * 1000), // 15分钟内最多20次刷新请求
  userController.refreshToken
);

router.get('/check-availability',
  userController.checkAvailability
);

// 需要认证的路由
router.use(authenticateToken);

router.get('/profile',
  userController.getProfile
);

router.put('/profile',
  validate(updateUserSchema),
  userController.updateProfile
);

router.post('/change-password',
  validate(changePasswordSchema),
  userController.changePassword
);

// 管理员路由
router.get('/list',
  requireAdmin,
  userController.getUsers
);

router.get('/stats',
  requireAdmin,
  userController.getUserStats
);

export default router;
