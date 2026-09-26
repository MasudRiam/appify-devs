# EchoGPT Backend — Day 1: Schema & Project Setup

NestJS + PostgreSQL + TypeORM + Swagger backend for the EchoGPT Chrome extension.

## What's in this scaffold

```
src/
  entities/
    role.entity.ts             # admin / user roles
    user.entity.ts              # central user table
    session.entity.ts           # refresh-token sessions (per device)
    subscription.entity.ts      # free/premium plan + usage limits
    ai-provider.entity.ts       # OpenAI/Claude/Gemini configs, encrypted keys
    chat-history.entity.ts      # ChatConversation + ChatMessage
    web-search.entity.ts        # search history + cache snapshot
    api-usage-log.entity.ts     # per-request log for analytics/admin panel
  config/
    typeorm.config.ts           # DataSource used by NestJS AND the CLI
  migrations/
    1758880000000-InitialSchema.ts   # hand-written SQL creating every table
  app.module.ts
  main.ts                       # bootstraps Nest + mounts Swagger at /api
```

## Why this schema shape

- **users ↔ roles**: many-to-one, so `admin`/`user` gating is a single join, not a boolean flag.
- **sessions** is separate from `users` so you can support "logout everywhere," per-device revocation, and refresh-token rotation. Only a *hash* of the refresh token is stored — never the raw token.
- **subscriptions** is one-to-one with `users`. `requestsUsed` / `requestLimit` gives you the "remaining requests" endpoint for free; `usageResetAt` is what a daily cron job bumps.
- **ai_providers.encryptedApiKey** has `select: false` in the entity — a plain `find()` never leaks it. Encrypt with AES-256 using `PROVIDER_KEY_ENCRYPTION_SECRET` in the service layer before saving, decrypt only at the point you call the provider's API.
- **chat_conversations / chat_messages** is split so a conversation can hold many turns, and each message can record which provider answered it (needed since users can switch providers mid-thread).
- **web_searches.resultsSnapshot** (jsonb) is what powers the caching bonus feature — check for a recent identical query before hitting a real search API.
- **api_usage_logs** is intentionally generic (any endpoint, not just chat) so the same table backs "Remaining Requests," "API Usage Analytics," and "Request Logs" in the admin panel.

## Setup

```bash
npm install
cp .env.example .env
# edit .env with your local Postgres credentials

# create the database first, e.g.:
createdb echogpt

npm run migration:run
npm run start:dev
```

Swagger docs will be live at `http://localhost:3000/api`.

## Next steps (Day 1 PM onward)

1. `AuthModule` — register/login/refresh using the `User` + `Session` entities above.
2. `UsersModule` — profile CRUD, guarded by the `Role` relation.
3. `SubscriptionsModule` — upgrade/downgrade + remaining-requests, reading/writing `Subscription`.

Each new module: generate with `nest g module <name>`, `nest g controller <name>`, `nest g service <name>`, then add it to the `imports` array in `app.module.ts`.
