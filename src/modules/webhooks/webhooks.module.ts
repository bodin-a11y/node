// src/modules/webhooks/webhooks.module.ts

import { Module } from '@nestjs/common';
import { PlanfixWebhookController } from './controllers/planfix-webhook.controller';
import { PlanfixWebhookService } from './services/planfix-webhook.service';
import { WebhooksService } from './services/webhooks.service';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [
    RealtimeModule, // нужен для WebhooksService -> RealtimeGateway
  ],
  controllers: [PlanfixWebhookController],
  providers: [PlanfixWebhookService, WebhooksService],
  exports: [PlanfixWebhookService, WebhooksService],
})
export class WebhooksModule {}
