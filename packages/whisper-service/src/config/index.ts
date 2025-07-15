import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
}

export interface ServerConfig {
  port: number;
  host: string;
  cors: {
    origin: string[];
    credentials: boolean;
  };
}

export interface SecurityConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptRounds: number;
}

export interface FileConfig {
  uploadDir: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
}

export interface Config {
  env: string;
  database: DatabaseConfig;
  server: ServerConfig;
  security: SecurityConfig;
  file: FileConfig;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value || defaultValue!;
};

const getEnvNumber = (key: string, defaultValue?: number): number => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required`);
  }
  const num = Number(value || defaultValue);
  if (isNaN(num)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return num;
};

const getEnvBoolean = (key: string, defaultValue?: boolean): boolean => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return (value || defaultValue?.toString()) === 'true';
};

export const config: Config = {
  env: getEnvVar('NODE_ENV', 'development'),
  
  database: {
    host: getEnvVar('DB_HOST', 'localhost'),
    port: getEnvNumber('DB_PORT', 3306),
    username: getEnvVar('DB_USERNAME', 'root'),
    password: getEnvVar('DB_PASSWORD', ''),
    database: getEnvVar('DB_DATABASE', 'whisper_design'),
    synchronize: getEnvBoolean('DB_SYNCHRONIZE', true),
    logging: getEnvBoolean('DB_LOGGING', false),
  },
  
  server: {
    port: getEnvNumber('PORT', 3002),
    host: getEnvVar('HOST', '0.0.0.0'),
    cors: {
      origin: getEnvVar('CORS_ORIGIN', 'http://localhost:5173,http://localhost:5174,http://localhost:5175').split(','),
      credentials: getEnvBoolean('CORS_CREDENTIALS', true),
    },
  },
  
  security: {
    jwtSecret: getEnvVar('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production'),
    jwtExpiresIn: getEnvVar('JWT_EXPIRES_IN', '7d'),
    bcryptRounds: getEnvNumber('BCRYPT_ROUNDS', 12),
  },
  
  file: {
    uploadDir: getEnvVar('UPLOAD_DIR', 'uploads'),
    maxFileSize: getEnvNumber('MAX_FILE_SIZE', 10 * 1024 * 1024), // 10MB
    allowedMimeTypes: getEnvVar(
      'ALLOWED_MIME_TYPES', 
      'image/jpeg,image/png,image/gif,image/webp,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ).split(','),
  },
};

// 验证配置
export const validateConfig = (): void => {
  const requiredEnvVars = ['DB_HOST', 'DB_USERNAME', 'DB_DATABASE'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar] && !getEnvVar(envVar, undefined)) {
      console.warn(`⚠️  Environment variable ${envVar} is not set, using default value`);
    }
  }
  
  console.log('✅ Configuration validated successfully');
  console.log(`🌍 Environment: ${config.env}`);
  if (config.env === 'development') {
    console.log(`🗄️  Database: SQLite (whisper_design.db)`);
  } else {
    console.log(`🗄️  Database: MySQL ${config.database.host}:${config.database.port}/${config.database.database}`);
  }
  console.log(`🚀 Server: ${config.server.host}:${config.server.port}`);
};
