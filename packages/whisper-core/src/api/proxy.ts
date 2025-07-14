import { Router, Request, Response, NextFunction } from 'express';
import { createError } from '../middleware/errorHandler';
import { proxyService } from '../services/proxyService';

const router: Router = Router();

// 通用代理接口 - 转发请求到数据服务层
router.all('/*', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const targetPath = req.params[0]; // 获取通配符匹配的路径
    const method = req.method.toLowerCase();
    
    // 构建目标URL
    const targetUrl = `${targetPath}`;
    
    // 准备请求数据
    const requestData = {
      method: method as 'get' | 'post' | 'put' | 'delete' | 'patch',
      url: targetUrl,
      headers: filterHeaders(req.headers),
      query: req.query,
      body: req.body,
    };

    // 通过代理服务转发请求
    const response = await proxyService.forwardRequest(requestData);

    // 设置响应头
    if (response.headers) {
      Object.entries(response.headers).forEach(([key, value]) => {
        res.setHeader(key, value as string);
      });
    }

    // 返回响应
    res.status(response.status || 200).json(response.data);
  } catch (error) {
    next(error);
  }
});

// AI服务代理 - 专门处理AI相关请求
router.post('/ai/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messages, model, temperature, maxTokens } = req.body;

    if (!messages || !Array.isArray(messages)) {
      throw createError.badRequest('Messages array is required');
    }

    const aiResponse = await proxyService.forwardToAI({
      messages,
      model: model || 'gpt-3.5-turbo',
      temperature: temperature || 0.7,
      maxTokens: maxTokens || 1000,
    });

    res.json({
      success: true,
      data: aiResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// 外部API代理 - 处理第三方服务请求
router.post('/external/:service', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { service } = req.params;
    const { endpoint, method = 'POST', data, headers } = req.body;

    if (!endpoint) {
      throw createError.badRequest('Endpoint is required');
    }

    const response = await proxyService.forwardToExternal({
      service,
      endpoint,
      method: method.toUpperCase(),
      data,
      headers,
    });

    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// 数据聚合接口 - 合并多个数据源
router.post('/aggregate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { requests } = req.body;

    if (!requests || !Array.isArray(requests)) {
      throw createError.badRequest('Requests array is required');
    }

    const aggregatedData = await proxyService.aggregateData(requests);

    res.json({
      success: true,
      data: aggregatedData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// 过滤敏感请求头
const filterHeaders = (headers: any) => {
  const filtered = { ...headers };
  
  // 移除可能导致问题的头部
  delete filtered.host;
  delete filtered.connection;
  delete filtered['content-length'];
  delete filtered['transfer-encoding'];
  
  return filtered;
};

export { router as proxyRoutes };
