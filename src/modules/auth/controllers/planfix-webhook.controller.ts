// Вебхук от Planfix на изменение задач.
// Сюда придёт событие, что заявка утверждена/отклонена дилером.
// Мы не возвращаем чувствительные данные, только { ok: true }.

import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { PublicSellerService } from '../services/public-seller.service';

@Controller('webhooks/planfix')
export class PlanfixWebhookController {
  constructor(private readonly service: PublicSellerService) {}

  @Post()
  @HttpCode(200)
  async handleWebhook(
    @Body() body: any,
    @Headers('x-planfix-signature') signature?: string, // TODO: проверить подпись (если настроена)
  ) {
    await this.service.handlePlanfixTaskUpdate(body);
    return { ok: true };
  }
}
