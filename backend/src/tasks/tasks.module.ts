import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthModule } from '../auth/auth.module';
import { Schedule } from '../entities/Schedule.entity';
import { User } from '../entities/User.entity';
import { ProjectsModule } from '../projects/projects.module';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';

@Module({
  imports: [MikroOrmModule.forFeature([Schedule, User]), AuthModule, ProjectsModule],
  controllers: [SchedulesController],
  providers: [SchedulesService],
})
export class TasksModule {}
