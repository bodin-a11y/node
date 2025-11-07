// Модуль авторизации и публичной регистрации продавца.
// Здесь мы сознательно держим публичные контроллеры (форма + webhook),
// а интеграцию с Planfix инкапсулируем в отдельном gateway-сервисе.

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PublicSellerController } from './controllers/public-seller.controller';
import { PlanfixWebhookController } from './controllers/planfix-webhook.controller';
import { PublicSellerService } from './services/public-seller.service';
import { PlanfixGateway } from './services/planfix.gateway';

@Module({
  imports: [
    // HttpModule даёт HttpService (axios-подобный клиент) с DI и интерцепторами
    HttpModule,
  ],
  controllers: [
    // Публичные ручки для формы продавца и для проверки статуса по ticketId
    PublicSellerController,
    // Временный вебхук Planfix (позже можно вынести в modules/webhooks)
    PlanfixWebhookController,
  ],
  providers: [
    // Бизнес-логика публичной регистрации продавца
    PublicSellerService,
    // Интеграция с Planfix API (поиск дилера, задачи, статусы, контакты)
    PlanfixGateway,
  ],
})
export class AuthModule {}
