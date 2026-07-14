import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager, ObjectId } from '@mikro-orm/mongodb';
import { Role, User } from '../entities/User.entity';

@Injectable()
export class UsersService {
  constructor(private readonly em: EntityManager) {}

  async list() {
    const users = await this.em.find(User, { deletedAt: null }, { orderBy: { name: 'asc' } });
    return users.map(({ id, name, email, role }) => ({ id, name, email, role }));
  }

  async updateRole(id: string, role: Role) {
    if (!Object.values(Role).includes(role)) throw new BadRequestException('Role must be admin, manager, or staff');
    if (!ObjectId.isValid(id)) throw new BadRequestException('Invalid user id');
    const user = await this.em.findOne(User, { _id: new ObjectId(id), deletedAt: null });
    if (!user) throw new NotFoundException('User not found');
    user.role = role;
    await this.em.flush();
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }
}
