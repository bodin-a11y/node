import { IsOptional, IsString, IsObject } from 'class-validator';

/**
 * DTO для тела вебхука от Planfix.
 *
 * Пока оставляем поля максимально универсальными,
 * а реальную структуру допишем, когда узнаем формат данных.
 */
export class PlanfixWebhookDto {
  @IsOptional()
  @IsString()
  eventType?: string;

  @IsOptional()
  @IsString()
  taskId?: string;

  @IsOptional()
  @IsString()
  contactId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsObject()
  task?: Record<string, any>;

  @IsOptional()
  @IsObject()
  warranty?: Record<string, any>;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  // fallback для неизвестных структур
  [key: string]: any;
}
