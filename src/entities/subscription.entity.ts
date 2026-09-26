import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum PlanType {
  FREE = 'free',
  PREMIUM = 'premium',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.subscription, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ type: 'enum', enum: PlanType, default: PlanType.FREE })
  plan: PlanType;

  // Daily/monthly quota depending on plan — checked before each chat/search call
  @Column({ default: 20 })
  requestLimit: number;

  @Column({ default: 0 })
  requestsUsed: number;

  // When the usage counter last reset (daily cron resets this)
  @Column({ type: 'timestamptz', nullable: true })
  usageResetAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  premiumExpiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
