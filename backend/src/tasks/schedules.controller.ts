import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../entities/User.entity';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchedulesController {
  constructor(private readonly schedules: SchedulesService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest) {
    return this.schedules.list(request.user!.sub, request.user!.role);
  }

  @Post()
  @Roles(Role.MANAGER)
  create(@Req() request: AuthenticatedRequest, @Body() body: Parameters<SchedulesService['create']>[1]) {
    return this.schedules.create(request.user!.sub, body);
  }

  @Patch(':id')
  @Roles(Role.MANAGER)
  update(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body() body: Parameters<SchedulesService['update']>[2]) {
    return this.schedules.update(request.user!.sub, id, body);
  }

  @Delete(':id')
  @Roles(Role.MANAGER)
  remove(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.schedules.remove(request.user!.sub, id);
  }
}
