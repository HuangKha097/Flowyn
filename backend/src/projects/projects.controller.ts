import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../entities/User.entity';
import { ProjectsService } from './projects.service';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest) {
    return this.projects.list(request.user!.sub, request.user!.role);
  }

  @Post()
  @Roles(Role.MANAGER)
  create(@Req() request: AuthenticatedRequest, @Body() body: { name?: string; color?: string }) {
    return this.projects.create(request.user!.sub, body);
  }

  @Patch(':id')
  @Roles(Role.MANAGER)
  update(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body() body: { name?: string; color?: string }) {
    return this.projects.update(request.user!.sub, id, body);
  }

  @Delete(':id/members/:memberId')
  @Roles(Role.MANAGER)
  removeMember(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Param('memberId') memberId: string) {
    return this.projects.removeMember(request.user!.sub, id, memberId);
  }

  @Delete(':id')
  @Roles(Role.MANAGER)
  remove(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body('confirmation') confirmation?: string) {
    return this.projects.remove(request.user!.sub, id, confirmation);
  }

  @Post(':id/invitations')
  @Roles(Role.MANAGER)
  invite(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body('email') email?: string) {
    return this.projects.invite(request.user!.sub, id, email);
  }
}
