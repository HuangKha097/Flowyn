import 'dotenv/config';
import { Options, MySqlDriver } from '@mikro-orm/mysql';
import { User } from './entities/User.entity';
import { Team } from './entities/Team.entity';
import { Project } from './entities/Project.entity';
import { Task } from './entities/Task.entity';

const config: Options = {
  driver: MySqlDriver,
  dbName: process.env.DB_NAME || 'flowyn',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  entities: [User, Team, Project, Task],
  debug: process.env.NODE_ENV !== 'production',
  migrations: {
    path: './migrations',
  },
};

export default config;
