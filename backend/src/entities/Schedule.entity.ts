import { Entity, Enum, ManyToOne, PrimaryKey, Property, SerializedPrimaryKey } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { Project } from './Project.entity';
import { User } from './User.entity';

export enum SchedulePriority {
  IMPORTANT = 'important',
  LESS_IMPORTANT = 'less_important',
  EASY = 'easy',
  OTHER = 'other',
}

@Entity()
export class Schedule {
  @PrimaryKey()
  _id = new ObjectId();

  @SerializedPrimaryKey()
  id!: string;

  @Property()
  title!: string;

  @ManyToOne(() => Project)
  project!: Project;

  @ManyToOne(() => User)
  staff!: User;

  @ManyToOne(() => User)
  createdBy!: User;

  @Property({ type: 'datetime' })
  startsAt!: Date;

  @Property({ type: 'datetime' })
  endsAt!: Date;

  @Property({ nullable: true })
  notes?: string;

  @Enum(() => SchedulePriority)
  priority = SchedulePriority.OTHER;

  @Property({ type: 'datetime' })
  createdAt = new Date();

  @Property({ onUpdate: () => new Date(), type: 'datetime' })
  updatedAt = new Date();
}
