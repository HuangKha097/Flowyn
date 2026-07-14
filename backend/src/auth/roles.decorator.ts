import { SetMetadata } from '@nestjs/common';
import { Role } from '../entities/User.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
