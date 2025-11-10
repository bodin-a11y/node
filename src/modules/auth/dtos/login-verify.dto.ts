import { IsString, Length } from 'class-validator';

/**
 * DTO для подтверждения OTP.
 * Пример тела:
 * {
 *   "otpId": "uuid",
 *   "code": "417295"
 * }
 */
export class VerifyOtpDto {
  @IsString()
  otpId!: string;

  @IsString()
  @Length(4, 10, { message: 'Код должен содержать 4–10 символов' })
  code!: string;
}
