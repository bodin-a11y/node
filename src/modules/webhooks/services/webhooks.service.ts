// src/modules/webhooks/services/webhooks.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { WebhookEvent, WebhookEventType } from '../webhooks.types';
import { RealtimeGateway } from '../../realtime/realtime.gateway';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly realtimeGateway: RealtimeGateway) {}

  /**
   * Общая точка входа для обработки внутренних webhook-событий.
   */
  async handleEvent(event: WebhookEvent): Promise<void> {
    this.logger.log(`Handle webhook event: ${event.source} / ${event.type}`);

    switch (event.type) {
      case WebhookEventType.WarrantyStatusChanged:
        await this.handleWarrantyStatusChanged(event);
        break;

      case WebhookEventType.WarrantyCreated:
        await this.handleWarrantyCreated(event);
        break;

      case WebhookEventType.ContactUpdated:
        await this.handleContactUpdated(event);
        break;

      case WebhookEventType.ReminderTriggered:
        await this.handleReminderTriggered(event);
        break;

      default:
        this.logger.warn(`Unknown webhook event type: ${event.type}`);
        break;
    }
  }

  /**
   * Изменение статуса гарантии.
   * Пушим событие во фронт через WebSocket.
   */
  private async handleWarrantyStatusChanged(event: WebhookEvent): Promise<void> {
    const warrantyId =
      event.payload.warrantyId ||
      event.payload.taskId ||
      event.payload.warranty_id ||
      null;

    const status =
      event.payload.status ||
      event.payload.newStatus ||
      event.payload.warrantyStatus ||
      null;

    if (!warrantyId || !status) {
      this.logger.warn(
        `handleWarrantyStatusChanged: no warrantyId/status in payload`,
      );
      return;
    }

    this.logger.log(
      `Notify frontend: warrantyStatusChanged (warrantyId=${warrantyId}, status=${status})`,
    );

    this.realtimeGateway.notifyWarrantyStatusChanged(
      String(warrantyId),
      String(status),
    );
  }

  /**
   * Создание гарантии (пока только логируем).
   */
  private async handleWarrantyCreated(event: WebhookEvent): Promise<void> {
    this.logger.log(
      `Warranty created event: payload=${JSON.stringify(event.payload)}`,
    );
    // Тут можно будет:
    // - создать запись у себя
    // - отправить уведомление и т.п.
  }

  /**
   * Обновление контакта (покупатель/продавец/монтажник).
   */
  private async handleContactUpdated(event: WebhookEvent): Promise<void> {
    this.logger.log(
      `Contact updated event: payload=${JSON.stringify(event.payload)}`,
    );
    // Можно будет синкать данные контакта, если понадобится.
  }

  /**
   * Напоминание / таймер / дедлайн.
   */
  private async handleReminderTriggered(event: WebhookEvent): Promise<void> {
    this.logger.log(
      `Reminder triggered event: payload=${JSON.stringify(event.payload)}`,
    );
    // Тут можно будет отправлять уведомление, напоминание и т.д.
  }
}
