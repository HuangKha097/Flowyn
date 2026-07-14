import { Entity, PrimaryKey, SerializedPrimaryKey, Property, ManyToOne, ManyToMany, OneToMany, Collection } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { Team } from './Team.entity';
import { Task } from './Task.entity';
import { User } from './User.entity';

@Entity()
export class Project {
  @PrimaryKey()
  _id = new ObjectId();

  @SerializedPrimaryKey()
  id!: string;

  @Property()
  name!: string;

  @Property()
  color!: string;

  @ManyToOne(() => Team, { nullable: true })
  team?: Team;

  @ManyToOne(() => User)
  manager!: User;

  @ManyToMany(() => User, undefined, { owner: true })
  staff = new Collection<User>(this);

  @OneToMany(() => Task, task => task.project)
  tasks = new Collection<Task>(this);

  @Property({ type: 'datetime' })
  createdAt = new Date();

  @Property({ onUpdate: () => new Date(), type: 'datetime' })
  updatedAt = new Date();

  @Property({ nullable: true, type: 'datetime' })
  deletedAt?: Date;
}
