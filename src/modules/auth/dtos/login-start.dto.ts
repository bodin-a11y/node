import { IsOptional, IsPhoneNumber, IsString } from 'class-validator';

/**
 * DTO для начала OTP-входа (продавец / монтажник).
 * Пример тела запроса:
 * {
 *   "identifier": "+380501234567",
 *   "sellerCode": "S-123456"
 * }
 */
export class LoginStartDto {
  @IsString()
  @IsPhoneNumber('UA', { message: 'Введите корректный номер телефона' })
  identifier!: string; // телефон (или telegramId, если позже добавим)

  @IsOptional()
  @IsString()
  sellerCode?: string; // нужно только для монтажника
}
