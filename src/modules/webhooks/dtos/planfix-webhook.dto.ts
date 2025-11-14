import { IsOptional, IsString, IsObject } from 'class-validator';

/**
 * DTO для вебхуков Planfix.
 * Универсальный, чтобы принимать любые события.
 */
export class PlanfixWebhookDto {
  // --- Общие поля ---
  @IsOptional()
  @IsString()
  eventType?: string;

  @IsOptional()
  @IsString()
  event?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  actionId?: string;

  @IsOptional()
  @IsString()
  objectId?: string;

  @IsOptional()
  @IsString()
  objectType?: string;

  // --- ID сущностей ---
  @IsOptional()
  @IsString()
  taskId?: string;

  @IsOptional()
  @IsString()
  contactId?: string;

  // --- Поля статусов ---
  @IsOptional()
  @IsString()
  status?: string;

  // --- Основные объекты ---
  @IsOptional()
  @IsObject()
  task?: Record<string, any>;

  @IsOptional()
  @IsObject()
  contact?: Record<string, any>;

  @IsOptional()
  @IsObject()
  warranty?: Record<string, any>;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsObject()
  modifiedFields?: Record<string, any>;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;

  // --- Raw универсальный fallback ---
  @IsOptional()
  @IsObject()
  raw?: any;

  // fallback для любых неизвестных полей
  [key: string]: any;
}
