import { Router, Request, Response, NextFunction } from 'express';
import { createError } from '../middleware/errorHandler';
import { userService } from '../services/userService';
// import type { IUser, UpdateUserParams } from '@shared/types';

// 临时类型定义
interface UpdateUserParams {
  displayName?: string;
  email?: string;
  preferences?: any;
}

const router: Router = Router();

// 获取用户信息
router.get('/profile/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await userService.getUserById(userId);
    
    if (!user) {
      throw createError.notFound('User not found');
    }

    res.json({
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// 更新用户信息
router.put('/profile/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const updateData: UpdateUserParams = req.body;

    const updatedUser = await userService.updateUser(userId, updateData);

    res.json({
      success: true,
      data: updatedUser,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// 获取用户列表（管理员功能）
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;

    const users = await userService.getUsers({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      role: role as string,
    });

    res.json({
      success: true,
      data: users,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// 用户状态更新
router.patch('/status/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['online', 'offline', 'away', 'busy'].includes(status)) {
      throw createError.badRequest('Invalid status value');
    }

    const updatedUser = await userService.updateUserStatus(userId, status);

    res.json({
      success: true,
      data: updatedUser,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// 用户偏好设置
router.put('/preferences/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const preferences = req.body;

    const updatedUser = await userService.updateUserPreferences(userId, preferences);

    res.json({
      success: true,
      data: updatedUser,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export { router as userRoutes };
