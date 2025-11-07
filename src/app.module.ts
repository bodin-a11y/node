import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '../shared/shared.module';
import { HealthModule } from '../health/health.module';
import { AuthModule } from '../modules/auth/auth.module';
import { AdminsModule } from '../modules/admins/admins.module';
import { PlanfixModule } from '../modules/planfix/planfix.module';
import { WarrantyModule } from '../modules/warranty/warranty.module';
import { TelegramModule } from '../modules/telegram/telegram.module';
import { WebhooksModule } from '../modules/webhooks/webhooks.module';
import { ThingsboardModule } from '../modules/thingsboard/thingsboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // .env доступен везде
    SharedModule,                              // глобальные фильтры/интерсепторы/логгер
    HealthModule,
    AuthModule,
    AdminsModule,
    PlanfixModule,
    WarrantyModule,
    TelegramModule,
    ThingsboardModule,
    WebhooksModule,
  ],
})
export class AppModule {}
