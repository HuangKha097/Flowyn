import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthModule } from '../auth/auth.module';
import { Invitation } from '../entities/Invitation.entity';
import { Project } from '../entities/Project.entity';
import { Schedule } from '../entities/Schedule.entity';
import { User } from '../entities/User.entity';
import { InvitationsController } from './invitations.controller';
import { MailService } from './mail.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [MikroOrmModule.forFeature([Project, Invitation, Schedule, User]), AuthModule],
  controllers: [ProjectsController, InvitationsController],
  providers: [ProjectsService, MailService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
