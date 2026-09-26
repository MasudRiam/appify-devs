import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dataSourceOptions),
    // AuthModule, UsersModule, SubscriptionsModule, AiProvidersModule,
    // ChatModule, WebSearchModule, AdminModule get added here as you build them
  ],
})
export class AppModule {}
