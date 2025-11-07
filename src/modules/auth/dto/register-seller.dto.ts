// DTO для тела формы регистрации продавца.
// ValidationPipe отфильтрует лишние поля и проверит формат.

import { IsEmail, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class RegisterSellerDto {
  /** Имя/фамилия продавца — отображаем в заявке и будущем контакте */
  @IsString()
  @IsNotEmpty()
  name: string;

  /** Email используем как идентификатор (сейчас без входа, но нужен для связи) */
  @IsEmail()
  email: string;

  /** Телефон необязателен (на будущее — пригодится для OTP/связи) */
  @IsOptional()
  @IsString()
  phone?: string;

  /** Код дилера — по нему валидируем к какому дилеру относится продавец */
  @IsString()
  @IsNotEmpty()
  dealerCode: string;

  /** Согласие на обработку данных — must-have для публичных форм */
  @IsBoolean()
  consent: boolean;
}
