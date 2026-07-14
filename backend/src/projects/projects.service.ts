import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager, ObjectId } from '@mikro-orm/mongodb';
import { createHash, randomBytes } from 'crypto';
import { Invitation, InvitationStatus } from '../entities/Invitation.entity';
import { Project } from '../entities/Project.entity';
import { Schedule } from '../entities/Schedule.entity';
import { Task } from '../entities/Task.entity';
import { Role, User } from '../entities/User.entity';
import { MailService } from './mail.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly em: EntityManager, private readonly mail: MailService) {}

  async list(userId: string, role: Role) {
    const user = await this.user(userId);
    const projects = role === Role.ADMIN
      ? await this.em.find(Project, { deletedAt: null }, { populate: ['manager', 'staff'] })
      : role === Role.MANAGER
        ? await this.em.find(Project, { manager: user, deletedAt: null }, { populate: ['manager', 'staff'] })
        : await this.em.find(Project, { staff: user, deletedAt: null }, { populate: ['manager', 'staff'] });
    return projects.map((project) => this.output(project));
  }

  async create(managerId: string, input: { name?: string; color?: string }) {
    const name = input.name?.trim();
    if (!name || name.length > 120) throw new BadRequestException('Project name is required');
    const manager = await this.user(managerId);
    const now = new Date();
    const project = this.em.create(Project, {
      name,
      color: input.color?.trim() || '#84cc16',
      manager,
      createdAt: now,
      updatedAt: now,
    });
    await this.em.persistAndFlush(project);
    return this.output(project);
  }

  async invite(managerId: string, projectId: string, rawEmail?: string) {
    const email = rawEmail?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BadRequestException('A valid staff email is required');
    const { project, manager } = await this.ownedProject(managerId, projectId);
    const staff = await this.em.findOne(User, { email, deletedAt: null });
    if (!staff) throw new NotFoundException('Cannot find this email');
    if (staff.role !== Role.STAFF) throw new BadRequestException('Only staff accounts can be invited');
    if (project.staff.contains(staff)) throw new BadRequestException('This member is already in the project');

    const token = randomBytes(32).toString('hex');
    let invitation = await this.em.findOne(Invitation, { project, email, status: InvitationStatus.PENDING });
    if (!invitation) {
      invitation = this.em.create(Invitation, {
        email,
        tokenHash: this.hash(token),
        project,
        invitedBy: manager,
        status: InvitationStatus.PENDING,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      });
      this.em.persist(invitation);
    } else {
      invitation.tokenHash = this.hash(token);
      invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    await this.em.flush();
    await this.mail.sendProjectInvitation({ to: email, projectName: project.name, managerName: manager.name, token });
    return { id: invitation.id, email, status: invitation.status, expiresAt: invitation.expiresAt };
  }

  async update(managerId: string, projectId: string, input: { name?: string; color?: string }) {
    const { project } = await this.ownedProject(managerId, projectId);
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name || name.length > 120) throw new BadRequestException('Project name is required and must be at most 120 characters');
      project.name = name;
    }
    if (input.color !== undefined) {
      const color = input.color.trim();
      if (!/^#[0-9a-f]{6}$/i.test(color)) throw new BadRequestException('Project color must be a valid hex color');
      project.color = color;
    }
    await this.em.flush();
    return this.output(project);
  }

  async removeMember(managerId: string, projectId: string, memberId: string) {
    const { project } = await this.ownedProject(managerId, projectId);
    if (!ObjectId.isValid(memberId)) throw new BadRequestException('Invalid member id');
    const staff = await this.em.findOne(User, { _id: new ObjectId(memberId), role: Role.STAFF, deletedAt: null });
    if (!staff || !project.staff.contains(staff)) throw new NotFoundException('Member is not part of this project');
    project.staff.remove(staff);
    await this.em.nativeDelete(Schedule, { project, staff });
    await this.em.flush();
    return { success: true };
  }

  async remove(managerId: string, projectId: string, confirmation?: string) {
    const { project } = await this.ownedProject(managerId, projectId);
    const expected = `delete this ${project.name}`;
    if (confirmation?.trim() !== expected) throw new BadRequestException(`Type "${expected}" to delete this project`);

    await this.em.nativeDelete(Schedule, { project });
    await this.em.nativeDelete(Task, { project });
    await this.em.nativeDelete(Invitation, { project });
    project.staff.removeAll();
    project.deletedAt = new Date();
    await this.em.flush();
    return { success: true };
  }

  async accept(token?: string) {
    if (!token) throw new BadRequestException('Invitation token is required');
    const invitation = await this.em.findOne(Invitation, { tokenHash: this.hash(token), status: InvitationStatus.PENDING }, { populate: ['project'] });
    if (!invitation) throw new NotFoundException('Invitation is invalid or already used');
    if (invitation.expiresAt.getTime() <= Date.now()) {
      invitation.status = InvitationStatus.EXPIRED;
      await this.em.flush();
      throw new BadRequestException('Invitation has expired');
    }
    const staff = await this.em.findOne(User, { email: invitation.email, role: Role.STAFF, deletedAt: null });
    if (!staff) throw new BadRequestException('Create a staff account with this email before accepting the invitation');
    invitation.project.staff.add(staff);
    invitation.status = InvitationStatus.ACCEPTED;
    invitation.acceptedAt = new Date();
    await this.em.flush();
    return { success: true, project: invitation.project.name };
  }

  async ownedProject(managerId: string, projectId: string) {
    if (!ObjectId.isValid(projectId)) throw new BadRequestException('Invalid project id');
    const manager = await this.user(managerId);
    const project = await this.em.findOne(Project, { _id: new ObjectId(projectId), manager, deletedAt: null }, { populate: ['staff'] });
    if (!project) throw new ForbiddenException('You can only manage your own projects');
    return { project, manager };
  }

  private async user(id: string) {
    const user = await this.em.findOne(User, { _id: new ObjectId(id), deletedAt: null });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private output(project: Project) {
    return {
      id: project.id,
      name: project.name,
      color: project.color,
      manager: { id: project.manager.id, name: project.manager.name, email: project.manager.email },
      staff: project.staff.getItems().map(({ id, name, email }) => ({ id, name, email })),
    };
  }

  private hash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
