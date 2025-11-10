import { IsPhoneNumber, IsString } from 'class-validator';

/**
 * DTO для регистрации монтажника (installer).
 * Пример:
 * {
 *   "name": "Петр Петров",
 *   "phone": "+380671234567",
 *   "sellerCode": "S-123456"
 * }
 */
export class RegisterInstallerDto {
  @IsString()
  sellerCode!: string;

  @IsString()
  name!: string;

  @IsPhoneNumber('UA', { message: 'Введите корректный номер телефона' })
  phone!: string;
}
