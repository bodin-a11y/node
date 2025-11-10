import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * DTO для входа администратора по паролю.
 * Пример тела:
 * {
 *   "emailOrLogin": "admin@site.com",
 *   "password": "secret123"
 * }
 */
export class AdminLoginDto {
  @IsString()
  @IsOptional()
  @IsEmail({}, { message: 'Введите корректный email' })
  emailOrLogin!: string;

  @IsString()
  @MinLength(4, { message: 'Пароль должен содержать минимум 4 символа' })
  password!: string;
}
