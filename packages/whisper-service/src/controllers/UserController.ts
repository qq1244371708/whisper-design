import { Request, Response } from 'express';
import { UserService } from '../services/UserService.js';
import { validateRegisterData, validateLoginData, validateUpdateUserData } from '../validators/userValidator.js';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = validateRegisterData(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message),
        });
        return;
      }

      const result = await this.userService.register(value);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: result.user,
          token: result.token,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      res.status(400).json({
        success: false,
        message,
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = validateLoginData(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message),
        });
        return;
      }

      const ip = req.ip || req.connection.remoteAddress;
      const result = await this.userService.login(value, ip);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          token: result.token,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      res.status(401).json({
        success: false,
        message,
      });
    }
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const user = await this.userService.getUserById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get profile',
      });
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { error, value } = validateUpdateUserData(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message),
        });
        return;
      }

      const user = await this.userService.updateUser(userId, value);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      res.status(400).json({
        success: false,
        message,
      });
    }
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password and new password are required',
        });
        return;
      }

      await this.userService.changePassword(userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to change password';
      res.status(400).json({
        success: false,
        message,
      });
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;
      if (!token) {
        res.status(400).json({
          success: false,
          message: 'Token is required',
        });
        return;
      }

      const newToken = await this.userService.refreshToken(token);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: { token: newToken },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refresh token';
      res.status(401).json({
        success: false,
        message,
      });
    }
  };

  checkAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, username } = req.query;
      const excludeUserId = req.user?.userId;

      const result: { email?: boolean; username?: boolean } = {};

      if (email) {
        result.email = await this.userService.isEmailAvailable(email as string, excludeUserId);
      }

      if (username) {
        result.username = await this.userService.isUsernameAvailable(username as string, excludeUserId);
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to check availability',
      });
    }
  };

  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page, limit, status, search } = req.query;

      const options = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as any,
        search: search as string,
      };

      const result = await this.userService.getUsers(options);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get users',
      });
    }
  };

  getUserStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.userService.getUserStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get user stats',
      });
    }
  };
}
