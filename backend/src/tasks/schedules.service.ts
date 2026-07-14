import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager, ObjectId } from '@mikro-orm/mongodb';
import { Schedule, SchedulePriority } from '../entities/Schedule.entity';
import { Role, User } from '../entities/User.entity';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class SchedulesService {
  constructor(private readonly em: EntityManager, private readonly projects: ProjectsService) {}

  async list(userId: string, role: Role) {
    const user = await this.user(userId);
    const schedules = role === Role.ADMIN
      ? await this.em.find(Schedule, {}, { populate: ['project', 'staff'] })
      : role === Role.MANAGER
        ? await this.em.find(Schedule, { createdBy: user }, { populate: ['project', 'staff'] })
        : await this.em.find(Schedule, { staff: user }, { populate: ['project', 'staff'] });
    return schedules.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime()).map((schedule) => this.output(schedule));
  }

  async create(managerId: string, input: { projectId?: string; staffId?: string; title?: string; startsAt?: string; endsAt?: string; notes?: string; priority?: SchedulePriority }) {
    const { project, manager } = await this.projects.ownedProject(managerId, input.projectId ?? '');
    const staff = await this.staff(input.staffId);
    if (!project.staff.contains(staff)) throw new ForbiddenException('This staff member has not accepted the project invitation');
    const dates = this.dates(input.startsAt, input.endsAt);
    const title = input.title?.trim();
    if (!title) throw new BadRequestException('Schedule title is required');
    const priority = this.priority(input.priority);
    const now = new Date();
    const schedule = this.em.create(Schedule, {
      title,
      project,
      staff,
      createdBy: manager,
      ...dates,
      notes: this.notes(input.notes),
      priority,
      createdAt: now,
      updatedAt: now,
    });
    await this.em.persistAndFlush(schedule);
    return this.output(schedule);
  }

  async update(managerId: string, id: string, input: { title?: string; startsAt?: string; endsAt?: string; notes?: string; priority?: SchedulePriority }) {
    const schedule = await this.ownedSchedule(managerId, id);
    if (input.title !== undefined) {
      if (!input.title.trim()) throw new BadRequestException('Schedule title is required');
      schedule.title = input.title.trim();
    }
    if (input.startsAt !== undefined || input.endsAt !== undefined) {
      const dates = this.dates(input.startsAt ?? schedule.startsAt.toISOString(), input.endsAt ?? schedule.endsAt.toISOString());
      schedule.startsAt = dates.startsAt;
      schedule.endsAt = dates.endsAt;
    }
    if (input.notes !== undefined) schedule.notes = this.notes(input.notes);
    if (input.priority !== undefined) schedule.priority = this.priority(input.priority);
    await this.em.flush();
    return this.output(schedule);
  }

  async remove(managerId: string, id: string) {
    const schedule = await this.ownedSchedule(managerId, id);
    await this.em.removeAndFlush(schedule);
    return { success: true };
  }

  private async ownedSchedule(managerId: string, id: string) {
    if (!ObjectId.isValid(id)) throw new BadRequestException('Invalid schedule id');
    const manager = await this.user(managerId);
    const schedule = await this.em.findOne(Schedule, { _id: new ObjectId(id), createdBy: manager }, { populate: ['project', 'staff'] });
    if (!schedule) throw new ForbiddenException('You can only change schedules for your own projects');
    return schedule;
  }

  private async staff(id?: string) {
    if (!id || !ObjectId.isValid(id)) throw new BadRequestException('Valid staff id is required');
    const user = await this.em.findOne(User, { _id: new ObjectId(id), role: Role.STAFF, deletedAt: null });
    if (!user) throw new NotFoundException('Staff user not found');
    return user;
  }

  private async user(id: string) {
    const user = await this.em.findOne(User, { _id: new ObjectId(id), deletedAt: null });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private dates(rawStart?: string, rawEnd?: string) {
    const startsAt = new Date(rawStart ?? '');
    const endsAt = new Date(rawEnd ?? '');
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
      throw new BadRequestException('A valid end time after the start time is required');
    }
    if (this.companyMinutes(startsAt) < 8 * 60 + 30 || this.companyMinutes(endsAt) > 18 * 60) {
      throw new BadRequestException('Schedules must stay within the company shift, 8:30 AM to 6:00 PM');
    }
    return { startsAt, endsAt };
  }

  private companyMinutes(date: Date) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: process.env.COMPANY_TIME_ZONE ?? 'Asia/Bangkok',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date);
    const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
    const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0);
    return hour * 60 + minute;
  }

  private output(schedule: Schedule) {
    return {
      id: schedule.id,
      title: schedule.title,
      startsAt: schedule.startsAt,
      endsAt: schedule.endsAt,
      notes: schedule.notes,
      priority: schedule.priority ?? SchedulePriority.OTHER,
      project: { id: schedule.project.id, name: schedule.project.name, color: schedule.project.color },
      staff: { id: schedule.staff.id, name: schedule.staff.name, email: schedule.staff.email },
    };
  }

  private priority(value?: SchedulePriority) {
    const priority = value ?? SchedulePriority.OTHER;
    if (!Object.values(SchedulePriority).includes(priority)) throw new BadRequestException('Invalid schedule priority');
    return priority;
  }

  private notes(value?: string) {
    const notes = value?.trim();
    if (notes && notes.length > 2000) throw new BadRequestException('Task notes must be at most 2000 characters');
    return notes || undefined;
  }
}
