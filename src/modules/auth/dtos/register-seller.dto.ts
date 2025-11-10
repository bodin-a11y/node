import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

/**
 * DTO для регистрации продавца (seller).
 * Пример:
 * {
 *   "name": "Иван Иванов",
 *   "email": "ivan@example.com",
 *   "phone": "+380501234567",
 *   "company": "ООО Вода-Сервис"
 * }
 */
export class RegisterSellerDto {
  @IsString()
  name!: string;

  @IsEmail({}, { message: 'Введите корректный email' })
  email!: string;

  @IsPhoneNumber('UA', { message: 'Введите корректный номер телефона' })
  phone!: string;

  @IsOptional()
  @IsString()
  company?: string;
}
