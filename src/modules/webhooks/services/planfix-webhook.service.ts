// src/modules/webhooks/services/planfix-webhook.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhookEvent, WebhookEventType } from '../webhooks.types';

@Injectable()
export class PlanfixWebhookService {
  private readonly logger = new Logger(PlanfixWebhookService.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  async handlePlanfixWebhook(
    body: any,
    headers: Record<string, any>,
  ): Promise<{
    success: boolean;
    eventType: WebhookEventType;
  }> {
    // 1. Логируем всё, что пришло
    this.logger.debug('Received Planfix webhook RAW', {
      headers,
      body,
    });

    // 2. (На будущее) проверка подписи/секрета
    const signature =
      headers['x-planfix-signature'] ||
      headers['x-planfix-secret'] ||
      headers['x-webhook-signature'];
    if (!signature) {
      this.logger.warn(
        'Planfix webhook without signature header (temporarily allowed)',
      );
    }

    // 3. Определяем тип события
    const eventType = this.detectEventType(body);

    // 4. Собираем payload (базовые поля + всё остальное)
    const payload = this.buildPayload(eventType, body);

    const event: WebhookEvent = {
      source: 'planfix',
      type: eventType,
      payload,
      raw: body,
    };

    // 5. Передаём в общий WebhooksService
    await this.webhooksService.handleEvent(event);

    return {
      success: true,
      eventType,
    };
  }

  private detectEventType(body: any): WebhookEventType {
    if (!body || typeof body !== 'object') {
      return WebhookEventType.Unknown;
    }

    const rawType: string =
      body.eventType ||
      body.event ||
      body.type ||
      body.action ||
      body.changeType ||
      '';

    const normalized = rawType.toLowerCase();

    if (normalized.includes('warranty') && normalized.includes('create')) {
      return WebhookEventType.WarrantyCreated;
    }

    if (
      normalized.includes('warranty') &&
      (normalized.includes('status') || normalized.includes('update'))
    ) {
      return WebhookEventType.WarrantyStatusChanged;
    }

    if (
      normalized.includes('contact') ||
      normalized.includes('client') ||
      normalized.includes('buyer') ||
      normalized.includes('installer') ||
      normalized.includes('seller')
    ) {
      return WebhookEventType.ContactUpdated;
    }

    if (
      normalized.includes('reminder') ||
      normalized.includes('timer') ||
      normalized.includes('deadline')
    ) {
      return WebhookEventType.ReminderTriggered;
    }

    // эвристика по структуре:
    if (body.taskId || body.task) {
      if (body.status || body.newStatus || body.task?.status) {
        return WebhookEventType.WarrantyStatusChanged;
      }
      return WebhookEventType.WarrantyCreated;
    }

    if (body.contactId || body.contact) {
      return WebhookEventType.ContactUpdated;
    }

    return WebhookEventType.Unknown;
  }

  private buildPayload(
    eventType: WebhookEventType,
    body: any,
  ): Record<string, any> {
    const payload: Record<string, any> = {};

    payload.eventType =
      body.eventType || body.event || body.type || body.action || null;
    payload.taskId = body.taskId || body.task?.id || null;
    payload.contactId =
      body.contactId || body.contact?.id || body.clientId || null;

    payload.status =
      body.status ||
      body.newStatus ||
      body.task?.status ||
      body.state ||
      null;

    payload.purchaseDate =
      body.purchaseDate ||
      body.task?.customFields?.purchaseDate ||
      body.customFields?.purchaseDate ||
      null;

    payload.activationDate =
      body.activationDate ||
      body.task?.customFields?.activationDate ||
      body.customFields?.activationDate ||
      null;

    payload.expirationDate =
      body.expirationDate ||
      body.task?.customFields?.expirationDate ||
      body.customFields?.expirationDate ||
      null;

    payload.warrantyNumber =
      body.warrantyNumber ||
      body.task?.customFields?.warrantyNumber ||
      null;

    payload.serialNumber =
      body.serialNumber || body.task?.customFields?.serialNumber || null;

    payload.qrCode =
      body.qrCode || body.task?.customFields?.qrCode || body.qr || null;

    payload.internalEventType = eventType;

    // плюс всё "как есть" в data, если надо:
    payload.rawData = body;

    return payload;
  }
}
