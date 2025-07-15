import { DataSource } from 'typeorm';
import { config } from './index.js';
import { User } from '../entities/User.js';
import { Conversation } from '../entities/Conversation.js';
import { Message } from '../entities/Message.js';
import { File } from '../entities/File.js';

export const AppDataSource = new DataSource({
  type: config.env === 'development' ? 'better-sqlite3' : 'mysql',
  ...(config.env === 'development'
    ? {
        database: 'whisper_design.db',
      }
    : {
        host: config.database.host,
        port: config.database.port,
        username: config.database.username,
        password: config.database.password,
        database: config.database.database,
        charset: 'utf8mb4',
        timezone: '+08:00',
        extra: {
          connectionLimit: 10,
          acquireTimeout: 60000,
          timeout: 60000,
        },
      }
  ),
  synchronize: config.database.synchronize,
  logging: config.database.logging,
  entities: [User, Conversation, Message, File],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: ['src/database/subscribers/*.ts'],
} as any);

export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 Initializing database connection...');
    console.log('📊 Database config:', {
      type: AppDataSource.options.type,
      database: AppDataSource.options.database,
      synchronize: config.database.synchronize,
    });

    await AppDataSource.initialize();
    console.log('✅ Database connection established successfully');

    if (config.database.synchronize) {
      console.log('🔄 Database schema synchronized');
    }
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.destroy();
    console.log('✅ Database connection closed successfully');
  } catch (error) {
    console.error('❌ Error during database closure:', error);
    throw error;
  }
};
