/**
 * 数据转换工具
 * 用于在不同数据格式之间进行转换和聚合
 */

export interface TransformRule {
  source: string;
  target: string;
  transform?: (value: any) => any;
}

export interface AggregationRule {
  sources: string[];
  target: string;
  aggregator: (values: any[]) => any;
}

export class DataTransformer {
  private transformRules: Map<string, TransformRule[]> = new Map();
  private aggregationRules: Map<string, AggregationRule[]> = new Map();

  /**
   * 添加转换规则
   */
  addTransformRule(schema: string, rule: TransformRule) {
    if (!this.transformRules.has(schema)) {
      this.transformRules.set(schema, []);
    }
    this.transformRules.get(schema)!.push(rule);
  }

  /**
   * 添加聚合规则
   */
  addAggregationRule(schema: string, rule: AggregationRule) {
    if (!this.aggregationRules.has(schema)) {
      this.aggregationRules.set(schema, []);
    }
    this.aggregationRules.get(schema)!.push(rule);
  }

  /**
   * 转换数据
   */
  transform(data: any, schema: string): any {
    const rules = this.transformRules.get(schema) || [];
    let result = { ...data };

    for (const rule of rules) {
      const sourceValue = this.getNestedValue(result, rule.source);
      if (sourceValue !== undefined) {
        const transformedValue = rule.transform ? rule.transform(sourceValue) : sourceValue;
        this.setNestedValue(result, rule.target, transformedValue);
      }
    }

    return result;
  }

  /**
   * 聚合数据
   */
  aggregate(dataArray: any[], schema: string): any {
    const rules = this.aggregationRules.get(schema) || [];
    let result: any = {};

    for (const rule of rules) {
      const values = dataArray.map(data => 
        rule.sources.map(source => this.getNestedValue(data, source))
      ).flat();
      
      const aggregatedValue = rule.aggregator(values);
      this.setNestedValue(result, rule.target, aggregatedValue);
    }

    return result;
  }

  /**
   * 批量转换
   */
  transformBatch(dataArray: any[], schema: string): any[] {
    return dataArray.map(data => this.transform(data, schema));
  }

  /**
   * 获取嵌套属性值
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * 设置嵌套属性值
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }
}

// 预定义的转换器
export const transformers = {
  // 时间戳转换
  timestampToDate: (timestamp: number) => new Date(timestamp).toISOString(),
  dateToTimestamp: (date: string) => new Date(date).getTime(),
  
  // 字符串转换
  toLowerCase: (str: string) => str.toLowerCase(),
  toUpperCase: (str: string) => str.toUpperCase(),
  trim: (str: string) => str.trim(),
  
  // 数字转换
  toNumber: (value: any) => Number(value),
  toString: (value: any) => String(value),
  
  // 数组转换
  arrayToString: (arr: any[], separator = ',') => arr.join(separator),
  stringToArray: (str: string, separator = ',') => str.split(separator),
  
  // 对象转换
  flattenObject: (obj: any, prefix = '') => {
    const flattened: any = {};
    for (const key in obj) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(flattened, transformers.flattenObject(obj[key], newKey));
      } else {
        flattened[newKey] = obj[key];
      }
    }
    return flattened;
  },
};

// 预定义的聚合器
export const aggregators = {
  sum: (values: number[]) => values.reduce((sum, val) => sum + val, 0),
  average: (values: number[]) => values.reduce((sum, val) => sum + val, 0) / values.length,
  max: (values: number[]) => Math.max(...values),
  min: (values: number[]) => Math.min(...values),
  count: (values: any[]) => values.length,
  unique: (values: any[]) => [...new Set(values)],
  concat: (values: any[][]) => values.flat(),
  merge: (values: any[]) => Object.assign({}, ...values),
};

// 默认数据转换器实例
export const defaultTransformer = new DataTransformer();

// 添加一些常用的转换规则
defaultTransformer.addTransformRule('message', {
  source: 'timestamp',
  target: 'createdAt',
  transform: transformers.timestampToDate,
});

defaultTransformer.addTransformRule('user', {
  source: 'name',
  target: 'displayName',
  transform: transformers.trim,
});

export default DataTransformer;
