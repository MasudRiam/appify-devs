import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('web_searches')
export class WebSearch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.webSearches, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  query: string;

  // Cached provider results as JSON, so a repeated identical query within
  // the cache window (bonus feature) can skip the outbound search call
  @Column({ type: 'jsonb', nullable: true })
  resultsSnapshot: Record<string, any>;

  @Column({ default: false })
  isCacheHit: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
