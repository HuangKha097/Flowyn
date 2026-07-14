import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../entities/User.entity';
import { AuthenticatedRequest } from './jwt-auth.guard';
import { ROLES_KEY } from './roles.decorator';
import { EntityManager, ObjectId } from '@mikro-orm/mongodb';
import { User } from '../entities/User.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly em: EntityManager) {}

  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!roles?.length) return true;
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user ? await this.em.findOne(User, { _id: new ObjectId(request.user.sub), deletedAt: null }) : null;
    if (!user || !roles.includes(user.role)) {
      throw new ForbiddenException('Only an admin can change user roles');
    }
    return true;
  }
}
