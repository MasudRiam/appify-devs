import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Session } from '../entities/session.entity';
import { Subscription } from '../entities/subscription.entity';
import { AiProvider } from '../entities/ai-provider.entity';
import { ChatConversation, ChatMessage } from '../entities/chat-history.entity';
import { WebSearch } from '../entities/web-search.entity';
import { ApiUsageLog } from '../entities/api-usage-log.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'echogpt',
  entities: [
    User,
    Role,
    Session,
    Subscription,
    AiProvider,
    ChatConversation,
    ChatMessage,
    WebSearch,
    ApiUsageLog,
  ],
  migrations: ['src/migrations/*.ts'],
  // Never true outside local prototyping — migrations own schema changes
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

// Required by the typeorm CLI (npm run typeorm / migration:generate / migration:run)
export default new DataSource(dataSourceOptions);
