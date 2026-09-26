import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { Role } from './role.entity';
import { Session } from './session.entity';
import { Subscription } from './subscription.entity';
import { AiProvider } from './ai-provider.entity';
import { ChatConversation } from './chat-history.entity';
import { WebSearch } from './web-search.entity';
import { ApiUsageLog } from './api-usage-log.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  email: string;

  // Never select this by default — see UsersService for explicit `.addSelect`
  @Column({ select: false })
  passwordHash: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true, select: false })
  emailVerificationToken: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  role: Role;

  @OneToOne(() => Subscription, (subscription) => subscription.user)
  subscription: Subscription;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => AiProvider, (provider) => provider.createdBy)
  createdProviders: AiProvider[];

  @OneToMany(() => ChatConversation, (conversation) => conversation.user)
  conversations: ChatConversation[];

  @OneToMany(() => WebSearch, (search) => search.user)
  webSearches: WebSearch[];

  @OneToMany(() => ApiUsageLog, (log) => log.user)
  usageLogs: ApiUsageLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Soft delete for "Delete Account" — keeps FK history intact
  @DeleteDateColumn()
  deletedAt: Date;
}
