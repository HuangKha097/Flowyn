import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection } from '@mikro-orm/core';
import { Team } from './Team.entity';
import { Task } from './Task.entity';

@Entity()
export class Project {
  @PrimaryKey()
  id!: string;

  @Property()
  name!: string;

  @Property()
  color!: string;

  @ManyToOne(() => Team)
  team!: Team;

  @OneToMany(() => Task, task => task.project)
  tasks = new Collection<Task>(this);

  @Property({ type: 'datetime' })
  createdAt = new Date();

  @Property({ onUpdate: () => new Date(), type: 'datetime' })
  updatedAt = new Date();

  @Property({ nullable: true, type: 'datetime' })
  deletedAt?: Date;
}
