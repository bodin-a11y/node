import { Controller, Post, Body, Headers } from '@nestjs/common';
import { PlanfixWebhookService } from '../services/planfix-webhook.service';

/**
 * Контроллер, который принимает вебхуки от Planfix.
 *
 * URL: POST /webhooks/planfix
 *
 * Этот endpoint НЕ для фронтенда и не для пользователя —
 * сюда будет стучаться только сам Planfix.
 */
@Controller('webhooks')
export class PlanfixWebhookController {
  constructor(
    private readonly planfixWebhookService: PlanfixWebhookService,
  ) {}

  /**
   * Основной вход для вебхуков Planfix.
   *
   * Сейчас:
   *  - принимаем тело и заголовки
   *  - передаём в сервис
   *  - возвращаем { success: true } (или то, что вернёт сервис)
   */
  @Post('planfix')
  async handlePlanfixWebhook(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    return this.planfixWebhookService.handlePlanfixWebhook(body, headers);
  }
}
