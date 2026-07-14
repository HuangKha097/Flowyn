import { Body, Controller, Post } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly projects: ProjectsService) {}

  @Post('accept')
  accept(@Body('token') token?: string) {
    return this.projects.accept(token);
  }
}
