import { Entity, Enum, ManyToOne, PrimaryKey, Property, SerializedPrimaryKey } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { Project } from './Project.entity';
import { User } from './User.entity';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
}

@Entity()
export class Invitation {
  @PrimaryKey()
  _id = new ObjectId();

  @SerializedPrimaryKey()
  id!: string;

  @Property()
  email!: string;

  @Property({ hidden: true })
  tokenHash!: string;

  @ManyToOne(() => Project)
  project!: Project;

  @ManyToOne(() => User)
  invitedBy!: User;

  @Enum(() => InvitationStatus)
  status = InvitationStatus.PENDING;

  @Property({ type: 'datetime' })
  expiresAt!: Date;

  @Property({ type: 'datetime' })
  createdAt = new Date();

  @Property({ nullable: true, type: 'datetime' })
  acceptedAt?: Date;
}
