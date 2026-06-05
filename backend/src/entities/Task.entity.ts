import { Entity, PrimaryKey, Property, Enum, ManyToOne, ManyToMany, Collection } from '@mikro-orm/core';
import { User } from './User.entity';
import { Project } from './Project.entity';

export enum TaskStatus {
  TODO = 'todo',
  PROGRESS = 'progress',
  REVIEW = 'review',
  DONE = 'done',
  OVERDUE = 'overdue',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Entity()
export class Task {
  @PrimaryKey()
  id!: string;

  @Property()
  title!: string;

  @Property({ nullable: true })
  description?: string;

  @ManyToOne(() => Project)
  project!: Project;

  @ManyToOne(() => User, { nullable: true })
  assignee?: User;

  @Enum(() => TaskStatus)
  status: TaskStatus = TaskStatus.TODO;

  @Enum(() => Priority)
  priority: Priority = Priority.MEDIUM;

  @Property({ type: 'int' })
  day!: number;

  @Property({ type: 'int' })
  startHour!: number;

  @Property({ type: 'int' })
  duration!: number;

  @Property({ nullable: true })
  category?: string;

  @Property({ type: 'datetime' })
  createdAt = new Date();

  @Property({ onUpdate: () => new Date(), type: 'datetime' })
  updatedAt = new Date();

  @Property({ nullable: true, type: 'datetime' })
  deletedAt?: Date;
}
