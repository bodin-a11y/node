import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Глобальные модули и подсистемы
import { SharedModule } from '../shared/shared.module';
import { HealthModule } from '../health/health.module';

// Бизнес-модули
import { AuthModule } from '../modules/auth/auth.module';
import { AdminsModule } from '../modules/admins/admins.module';
import { PlanfixModule } from '../modules/planfix/planfix.module';
import { WarrantyModule } from '../modules/warranty/warranty.module';
import { TelegramModule } from '../modules/telegram/telegram.module';
import { WebhooksModule } from '../modules/webhooks/webhooks.module';
import { ThingsboardModule } from '../modules/thingsboard/thingsboard.module';

// Конфиги и валидация окружения
import planfixConfig from './config/planfix.config';
import { envSchema } from './config/env.validation';

@Module({
  imports: [
    // Глобальный модуль конфигурации:
    // - делает .env доступным везде
    // - подгружает конфиги из config/*
    // - валидирует обязательные переменные окружения
    ConfigModule.forRoot({
      isGlobal: true,
      load: [planfixConfig],
      validate: (env) => envSchema.parse(env),
    }),

    // Общие утилиты, фильтры ошибок, логгер и т.д.
    SharedModule,

    // Проверка работоспособности сервера (/health, /ready)
    HealthModule,

    // Основные модули приложения
    AuthModule,          // логика регистрации/входа, включая форму продавца
    AdminsModule,        // управление администраторами (и супер-админом)
    PlanfixModule,       // единый клиент для Planfix API
    WarrantyModule,      // обработка гарантийных талонов
    TelegramModule,      // интеграция Telegram-бота
    ThingsboardModule,   // связь с ThingsBoard (IoT)
    WebhooksModule,      // обработка входящих вебхуков (Planfix, Telegram)
  ],
})
export class AppModule {}
