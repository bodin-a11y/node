// src/modules/webhooks/webhooks.types.ts

export type WebhookSource = 'planfix';

export enum WebhookEventType {
  WarrantyCreated = 'warranty_created',
  WarrantyStatusChanged = 'warranty_status_changed',
  ContactUpdated = 'contact_updated',
  ReminderTriggered = 'reminder_triggered',
  Unknown = 'unknown',
}

/**
 * Унифицированное внутреннее событие вебхуков,
 * с которым уже работает наш backend.
 */
export interface WebhookEvent {
  source: WebhookSource;
  type: WebhookEventType;
  payload: Record<string, any>;
  raw: any;
}
