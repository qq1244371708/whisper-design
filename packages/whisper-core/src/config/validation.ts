/**
 * 环境变量验证
 */

export interface EnvValidationRule {
  key: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean';
  defaultValue?: any;
  validator?: (value: any) => boolean;
  description: string;
}

export const envRules: EnvValidationRule[] = [
  {
    key: 'NODE_ENV',
    required: false,
    type: 'string',
    defaultValue: 'development',
    validator: (value) => ['development', 'production', 'test'].includes(value),
    description: 'Application environment',
  },
  {
    key: 'PORT',
    required: false,
    type: 'number',
    defaultValue: 3001,
    validator: (value) => value > 0 && value < 65536,
    description: 'Server port number',
  },
  {
    key: 'JWT_SECRET',
    required: true,
    type: 'string',
    validator: (value) => value && value.length >= 32,
    description: 'JWT signing secret (minimum 32 characters)',
  },
  {
    key: 'CORS_ORIGIN',
    required: false,
    type: 'string',
    description: 'Allowed CORS origins (comma-separated)',
  },
  {
    key: 'LOG_LEVEL',
    required: false,
    type: 'string',
    defaultValue: 'info',
    validator: (value) => ['error', 'warn', 'info', 'debug'].includes(value),
    description: 'Logging level',
  },
];

export class ConfigValidationError extends Error {
  constructor(message: string, public errors: string[]) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

export function validateEnvironment(): void {
  const errors: string[] = [];

  for (const rule of envRules) {
    const value = process.env[rule.key];

    // 检查必需字段
    if (rule.required && !value) {
      errors.push(`Missing required environment variable: ${rule.key} - ${rule.description}`);
      continue;
    }

    // 如果有值，进行类型和格式验证
    if (value) {
      // 类型验证
      let typedValue: any = value;
      if (rule.type === 'number') {
        typedValue = Number(value);
        if (isNaN(typedValue)) {
          errors.push(`Invalid number for ${rule.key}: ${value}`);
          continue;
        }
      } else if (rule.type === 'boolean') {
        typedValue = value.toLowerCase() === 'true';
      }

      // 自定义验证器
      if (rule.validator && !rule.validator(typedValue)) {
        errors.push(`Invalid value for ${rule.key}: ${value} - ${rule.description}`);
      }
    }
  }

  if (errors.length > 0) {
    throw new ConfigValidationError('Environment validation failed', errors);
  }
}

export function getEnvValue(key: string, defaultValue?: any): any {
  const rule = envRules.find(r => r.key === key);
  const value = process.env[key];

  if (!value) {
    return defaultValue ?? rule?.defaultValue;
  }

  if (rule?.type === 'number') {
    return Number(value);
  } else if (rule?.type === 'boolean') {
    return value.toLowerCase() === 'true';
  }

  return value;
}
