import { Router, Request, Response, NextFunction } from 'express';
import { createError } from '../middleware/errorHandler';
import { defaultRenderer } from '../ssr/renderer';

const router: Router = Router();

// SSR渲染接口
router.post('/render', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      template = 'default',
      data = {},
      options = {},
    } = req.body;

    const context = {
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
      cookies: req.cookies,
      headers: req.headers as Record<string, string>,
      query: req.query,
      user: (req as any).user, // 假设有用户认证中间件
    };

    const result = await defaultRenderer.render(template, context, data, options);

    if (result.redirectTo) {
      return res.redirect(result.statusCode || 302, result.redirectTo);
    }

    res.status(result.statusCode || 200);
    
    // 设置响应头
    if (result.meta) {
      res.setHeader('X-SSR-Title', result.meta.title || '');
      res.setHeader('X-SSR-Description', result.meta.description || '');
    }

    res.send(result.html);
  } catch (error) {
    next(error);
  }
});

// 预渲染接口
router.post('/prerender', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { routes } = req.body;

    if (!routes || !Array.isArray(routes)) {
      throw createError.badRequest('Routes array is required');
    }

    const results = await defaultRenderer.prerender(routes);
    const output: Record<string, any> = {};

    for (const [route, result] of results.entries()) {
      output[route] = {
        html: result.html,
        meta: result.meta,
        statusCode: result.statusCode,
      };
    }

    res.json({
      success: true,
      data: output,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// 清理SSR缓存
router.delete('/cache', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pattern } = req.query;
    const cleared = defaultRenderer.clearCache(pattern as string);

    res.json({
      success: true,
      data: { cleared },
      message: `Cleared ${cleared} cache entries`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// 获取SSR统计信息
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = defaultRenderer.getStats();

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// 注册模板
router.post('/templates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, template } = req.body;

    if (!name || !template) {
      throw createError.badRequest('Template name and content are required');
    }

    defaultRenderer.registerTemplate(name, template);

    res.json({
      success: true,
      message: `Template '${name}' registered successfully`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export { router as ssrRoutes };
