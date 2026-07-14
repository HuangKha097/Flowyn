import 'dotenv/config';
import { Options, MongoDriver } from '@mikro-orm/mongodb';
import { User } from './entities/User.entity';
import { Team } from './entities/Team.entity';
import { Project } from './entities/Project.entity';
import { Task } from './entities/Task.entity';
import { Invitation } from './entities/Invitation.entity';
import { Schedule } from './entities/Schedule.entity';

const config: Options = {
  driver: MongoDriver,
  clientUrl: process.env.DATABASE_URL,
  dbName: process.env.DB_NAME || 'flowyn',
  entities: [User, Team, Project, Task, Invitation, Schedule],
  ensureIndexes: true,
  debug: process.env.NODE_ENV !== 'production',
};

export default config;
