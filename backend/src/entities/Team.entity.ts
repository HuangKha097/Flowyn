import { Entity, PrimaryKey, Property, OneToMany, Collection, OneToOne } from '@mikro-orm/core';
import { User } from './User.entity';
import { Project } from './Project.entity';

@Entity()
export class Team {
  @PrimaryKey()
  id!: string;

  @Property()
  name!: string;

  @OneToOne(() => User, { nullable: true })
  head?: User;

  @OneToMany(() => User, user => user.team)
  members = new Collection<User>(this);

  @OneToMany(() => Project, project => project.team)
  projects = new Collection<Project>(this);

  @Property({ type: 'datetime' })
  createdAt = new Date();

  @Property({ onUpdate: () => new Date(), type: 'datetime' })
  updatedAt = new Date();

  @Property({ nullable: true, type: 'datetime' })
  deletedAt?: Date;
}
