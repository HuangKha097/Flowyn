import { Entity, PrimaryKey, SerializedPrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { Team } from './Team.entity';
import { Task } from './Task.entity';

export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
}

@Entity()
export class User {
  @PrimaryKey()
  _id = new ObjectId();

  @SerializedPrimaryKey()
  id!: string;

  @Property()
  name!: string;

  @Property({ unique: true })
  email!: string;

  @Property()
  password!: string;

  @Enum(() => Role)
  role: Role = Role.STAFF;

  @Property({ nullable: true, hidden: true })
  refreshTokenHash?: string;

  @Property({ nullable: true })
  avatarUrl?: string;

  @Property({ type: 'json', nullable: true })
  skills?: string[];

  @ManyToOne(() => Team, { nullable: true })
  team?: Team;

  @OneToMany(() => Task, task => task.assignee)
  assignedTasks = new Collection<Task>(this);

  @Property({ type: 'datetime' })
  createdAt = new Date();

  @Property({ onUpdate: () => new Date(), type: 'datetime' })
  updatedAt = new Date();

  @Property({ nullable: true, type: 'datetime' })
  deletedAt?: Date;
}
