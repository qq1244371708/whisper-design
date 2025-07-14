/**
 * SSR渲染器
 * 预留接口，为未来的服务端渲染功能做准备
 */

import { globalCache } from '../utils/cache';

export interface SSRContext {
  url: string;
  userAgent?: string;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
  query?: Record<string, any>;
  user?: any;
}

export interface SSRResult {
  html: string;
  css?: string;
  js?: string;
  meta?: {
    title?: string;
    description?: string;
    keywords?: string;
    [key: string]: any;
  };
  statusCode?: number;
  redirectTo?: string;
}

export interface SSROptions {
  enableCache?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  timeout?: number;
}

export class SSRRenderer {
  private templates = new Map<string, string>();
  private components = new Map<string, any>();

  /**
   * 注册模板
   */
  registerTemplate(name: string, template: string): void {
    this.templates.set(name, template);
  }

  /**
   * 注册组件
   */
  registerComponent(name: string, component: any): void {
    this.components.set(name, component);
  }

  /**
   * 渲染页面
   */
  async render(
    template: string,
    context: SSRContext,
    data: any = {},
    options: SSROptions = {}
  ): Promise<SSRResult> {
    const {
      enableCache = true,
      cacheKey,
      cacheTTL = 600,
      timeout = 5000,
    } = options;

    // 生成缓存键
    const finalCacheKey = cacheKey || this.generateCacheKey(template, context, data);

    // 尝试从缓存获取
    if (enableCache) {
      const cached = globalCache.get(finalCacheKey);
      if (cached) {
        return cached as SSRResult;
      }
    }

    try {
      // 执行渲染（带超时）
      const result = await Promise.race([
        this.performRender(template, context, data),
        this.createTimeoutPromise(timeout),
      ]);

      // 缓存结果
      if (enableCache && result.statusCode !== 500) {
        globalCache.set(finalCacheKey, result, cacheTTL);
      }

      return result;
    } catch (error) {
      console.error('[SSR] Render error:', error);
      return this.createErrorResult(error);
    }
  }

  /**
   * 预渲染静态页面
   */
  async prerender(routes: string[]): Promise<Map<string, SSRResult>> {
    const results = new Map<string, SSRResult>();

    for (const route of routes) {
      try {
        const context: SSRContext = { url: route };
        const result = await this.render('default', context, {}, { enableCache: false });
        results.set(route, result);
      } catch (error) {
        console.error(`[SSR] Prerender failed for route ${route}:`, error);
      }
    }

    return results;
  }

  /**
   * 清理SSR缓存
   */
  clearCache(pattern?: string): number {
    if (!pattern) {
      globalCache.clear();
      return 0;
    }

    let cleared = 0;
    const keys = globalCache.keys();
    
    for (const key of keys) {
      if (key.includes(pattern)) {
        globalCache.delete(key);
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * 获取SSR统计信息
   */
  getStats() {
    return {
      cache: globalCache.stats(),
      templates: this.templates.size,
      components: this.components.size,
    };
  }

  /**
   * 执行实际渲染
   */
  private async performRender(
    template: string,
    context: SSRContext,
    data: any
  ): Promise<SSRResult> {
    // 这里是实际的渲染逻辑
    // 目前返回模拟结果，未来可以集成React SSR、Vue SSR等
    
    const templateContent = this.templates.get(template) || this.getDefaultTemplate();
    
    // 模拟渲染过程
    const html = this.interpolateTemplate(templateContent, {
      ...data,
      url: context.url,
      userAgent: context.userAgent,
    });

    return {
      html,
      css: '/* Generated CSS */',
      js: '/* Generated JS */',
      meta: {
        title: data.title || 'Whisper Design',
        description: data.description || 'AI Chat Application',
        keywords: data.keywords || 'ai, chat, whisper',
      },
      statusCode: 200,
    };
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(template: string, context: SSRContext, data: any): string {
    const keyData = {
      template,
      url: context.url,
      user: context.user?.id,
      dataHash: this.hashObject(data),
    };
    return `ssr:${Buffer.from(JSON.stringify(keyData)).toString('base64')}`;
  }

  /**
   * 创建超时Promise
   */
  private createTimeoutPromise(timeout: number): Promise<SSRResult> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`SSR render timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * 创建错误结果
   */
  private createErrorResult(error: any): SSRResult {
    return {
      html: `<div>Render Error: ${error.message}</div>`,
      statusCode: 500,
      meta: {
        title: 'Error',
        description: 'Server render error',
      },
    };
  }

  /**
   * 获取默认模板
   */
  private getDefaultTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>{{title}}</title>
  <meta name="description" content="{{description}}">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <div id="app">{{content}}</div>
  <script>window.__INITIAL_DATA__ = {{data}};</script>
</body>
</html>
    `.trim();
  }

  /**
   * 模板插值
   */
  private interpolateTemplate(template: string, data: any): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  /**
   * 对象哈希
   */
  private hashObject(obj: any): string {
    return Buffer.from(JSON.stringify(obj)).toString('base64').slice(0, 8);
  }
}

// 默认SSR渲染器实例
export const defaultRenderer = new SSRRenderer();

// 注册默认模板
defaultRenderer.registerTemplate('default', `
<!DOCTYPE html>
<html>
<head>
  <title>{{title}}</title>
  <meta name="description" content="{{description}}">
  <meta name="keywords" content="{{keywords}}">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>{{css}}</style>
</head>
<body>
  <div id="app">{{content}}</div>
  <script>
    window.__INITIAL_DATA__ = {{data}};
    window.__SSR_CONTEXT__ = {{context}};
  </script>
  <script>{{js}}</script>
</body>
</html>
`);

export default SSRRenderer;
