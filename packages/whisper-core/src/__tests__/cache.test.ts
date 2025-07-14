/**
 * 缓存系统测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryCache } from '../utils/cache';

describe('MemoryCache', () => {
  let cache: MemoryCache<string>;

  beforeEach(() => {
    cache = new MemoryCache<string>({
      ttl: 1, // 1秒
      maxSize: 3,
    });
  });

  describe('基本功能', () => {
    it('应该能够设置和获取缓存', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('应该在键不存在时返回undefined', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('应该能够删除缓存', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeUndefined();
    });

    it('应该能够检查缓存是否存在', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('应该能够清空所有缓存', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.size()).toBe(0);
    });
  });

  describe('TTL功能', () => {
    it('应该在TTL过期后自动删除缓存', async () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
      
      // 等待TTL过期
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(cache.get('key1')).toBeUndefined();
    });

    it('应该支持自定义TTL', async () => {
      cache.set('key1', 'value1', 2); // 2秒TTL
      
      // 1秒后仍然存在
      await new Promise(resolve => setTimeout(resolve, 1100));
      expect(cache.get('key1')).toBe('value1');
      
      // 2秒后过期
      await new Promise(resolve => setTimeout(resolve, 1100));
      expect(cache.get('key1')).toBeUndefined();
    });
  });

  describe('LRU淘汰', () => {
    it('应该在达到最大容量时淘汰最旧的项', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.set('key4', 'value4'); // 应该淘汰key1
      
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
    });
  });

  describe('统计功能', () => {
    it('应该返回正确的统计信息', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      const stats = cache.stats();
      expect(stats.total).toBe(2);
      expect(stats.valid).toBe(2);
      expect(stats.expired).toBe(0);
      expect(stats.maxSize).toBe(3);
    });

    it('应该正确统计过期项', async () => {
      cache.set('key1', 'value1');
      
      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const stats = cache.stats();
      expect(stats.expired).toBe(1);
      expect(stats.valid).toBe(0);
    });
  });

  describe('清理功能', () => {
    it('应该能够清理过期项', async () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const cleaned = cache.cleanup();
      expect(cleaned).toBe(2);
      expect(cache.size()).toBe(0);
    });
  });
});
