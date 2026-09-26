import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

// One row per billable/limited API call — powers the admin "API Usage Analytics"
// and "Request Logs" endpoints, and the subscription "remaining requests" count.
@Entity('api_usage_logs')
export class ApiUsageLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.usageLogs, { onDelete: 'CASCADE' })
  user: User;

  @Index()
  @Column()
  endpoint: string;

  @Column()
  method: string;

  @Column()
  statusCode: number;

  @Column({ nullable: true })
  providerName: string;

  @Column({ nullable: true })
  responseTimeMs: number;

  @CreateDateColumn()
  createdAt: Date;
}
