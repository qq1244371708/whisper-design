import { Router, Request, Response, NextFunction } from 'express';
import { createError } from '../middleware/errorHandler';
import { fileService } from '../services/fileService';
// import type { UploadedFile, FileUploadParams } from '@shared/types';

// 临时类型定义
interface FileUploadParams {
  files: any[];
  userId: string;
}

const router: Router = Router();

// 文件上传
router.post('/upload', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uploadParams: FileUploadParams = req.body;
    
    if (!uploadParams.files || uploadParams.files.length === 0) {
      throw createError.badRequest('No files provided');
    }

    const uploadedFiles = await fileService.uploadFiles(uploadParams);

    res.status(201).json({
      success: true,
      data: uploadedFiles,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// 获取文件信息
router.get('/:fileId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params;

    const file = await fileService.getFileById(fileId);
    
    if (!file) {
      throw createError.notFound('File not found');
    }

    res.json({
      success: true,
      data: file,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// 下载文件
router.get('/download/:fileId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params;

    const fileStream = await fileService.downloadFile(fileId);

    if (!fileStream) {
      throw createError.notFound('File not found');
    }

    // 设置响应头
    res.setHeader('Content-Type', (fileStream as any).contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${(fileStream as any).filename || 'download'}"`);

    // 流式传输文件
    (fileStream as any).stream?.pipe(res);
  } catch (error) {
    next(error);
  }
});

// 删除文件
router.delete('/:fileId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      throw createError.badRequest('userId is required');
    }

    await fileService.deleteFile(fileId, userId as string);

    res.json({
      success: true,
      message: 'File deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// 获取用户文件列表
router.get('/user/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type, search } = req.query;

    const files = await fileService.getUserFiles({
      userId,
      page: Number(page),
      limit: Number(limit),
      type: type as string,
      search: search as string,
    });

    res.json({
      success: true,
      data: files,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// 生成文件预览URL
router.post('/preview/:fileId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params;
    const { width, height, quality } = req.body;

    const previewUrl = await fileService.generatePreview(fileId, {
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
      quality: quality ? Number(quality) : undefined,
    });

    res.json({
      success: true,
      data: { previewUrl },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export { router as fileRoutes };
