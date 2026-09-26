import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1758880000000 implements MigrationInterface {
  name = 'InitialSchema1758880000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TYPE "role_name_enum" AS ENUM ('admin', 'user')
    `);
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" "role_name_enum" NOT NULL UNIQUE,
        "description" varchar,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar NOT NULL,
        "passwordHash" varchar NOT NULL,
        "fullName" varchar,
        "isEmailVerified" boolean NOT NULL DEFAULT false,
        "emailVerificationToken" varchar,
        "isActive" boolean NOT NULL DEFAULT true,
        "roleId" uuid REFERENCES "roles"("id"),
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email")`,
    );

    await queryRunner.query(`
      CREATE TABLE "sessions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "refreshTokenHash" varchar NOT NULL,
        "userAgent" varchar,
        "ipAddress" varchar,
        "expiresAt" timestamptz NOT NULL,
        "isRevoked" boolean NOT NULL DEFAULT false,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_sessions_refreshTokenHash" ON "sessions" ("refreshTokenHash")`,
    );

    await queryRunner.query(`
      CREATE TYPE "plan_type_enum" AS ENUM ('free', 'premium')
    `);
    await queryRunner.query(`
      CREATE TABLE "subscriptions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
        "plan" "plan_type_enum" NOT NULL DEFAULT 'free',
        "requestLimit" integer NOT NULL DEFAULT 20,
        "requestsUsed" integer NOT NULL DEFAULT 0,
        "usageResetAt" timestamptz,
        "premiumExpiresAt" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "provider_name_enum" AS ENUM ('openai', 'anthropic', 'gemini')
    `);
    await queryRunner.query(`
      CREATE TABLE "ai_providers" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" "provider_name_enum" NOT NULL,
        "displayName" varchar,
        "encryptedApiKey" varchar NOT NULL,
        "baseUrl" varchar,
        "defaultModel" varchar,
        "isEnabled" boolean NOT NULL DEFAULT true,
        "isDefault" boolean NOT NULL DEFAULT false,
        "lastHealthStatus" varchar NOT NULL DEFAULT 'unknown',
        "lastHealthCheckAt" timestamptz,
        "createdById" uuid REFERENCES "users"("id"),
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "chat_conversations" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "title" varchar,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "message_role_enum" AS ENUM ('user', 'assistant')
    `);
    await queryRunner.query(`
      CREATE TABLE "chat_messages" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "conversationId" uuid NOT NULL REFERENCES "chat_conversations"("id") ON DELETE CASCADE,
        "providerId" uuid REFERENCES "ai_providers"("id"),
        "role" "message_role_enum" NOT NULL,
        "content" text NOT NULL,
        "tokenCount" integer,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "web_searches" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "query" varchar NOT NULL,
        "resultsSnapshot" jsonb,
        "isCacheHit" boolean NOT NULL DEFAULT false,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "api_usage_logs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "endpoint" varchar NOT NULL,
        "method" varchar NOT NULL,
        "statusCode" integer NOT NULL,
        "providerName" varchar,
        "responseTimeMs" integer,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_usage_logs_endpoint" ON "api_usage_logs" ("endpoint")`,
    );

    // Seed the two roles the app relies on
    await queryRunner.query(`
      INSERT INTO "roles" ("name", "description") VALUES
      ('admin', 'Full access to admin panel APIs'),
      ('user', 'Standard end-user account')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "api_usage_logs"`);
    await queryRunner.query(`DROP TABLE "web_searches"`);
    await queryRunner.query(`DROP TABLE "chat_messages"`);
    await queryRunner.query(`DROP TYPE "message_role_enum"`);
    await queryRunner.query(`DROP TABLE "chat_conversations"`);
    await queryRunner.query(`DROP TABLE "ai_providers"`);
    await queryRunner.query(`DROP TYPE "provider_name_enum"`);
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(`DROP TYPE "plan_type_enum"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TYPE "role_name_enum"`);
  }
}
