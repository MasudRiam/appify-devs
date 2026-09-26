import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ChatMessage } from './chat-history.entity';

export enum ProviderName {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GEMINI = 'gemini',
}

@Entity('ai_providers')
export class AiProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ProviderName })
  name: ProviderName;

  @Column({ nullable: true })
  displayName: string;

  // AES-256 encrypted at the service layer before insert — never store plaintext.
  // select: false so a normal find() never accidentally returns it.
  @Column({ select: false })
  encryptedApiKey: string;

  @Column({ nullable: true })
  baseUrl: string;

  @Column({ nullable: true })
  defaultModel: string;

  @Column({ default: true })
  isEnabled: boolean;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: 'unknown' })
  lastHealthStatus: string; // 'healthy' | 'unhealthy' | 'unknown'

  @Column({ type: 'timestamptz', nullable: true })
  lastHealthCheckAt: Date;

  @ManyToOne(() => User, (user) => user.createdProviders, { nullable: true })
  createdBy: User;

  @OneToMany(() => ChatMessage, (message) => message.provider)
  messages: ChatMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
