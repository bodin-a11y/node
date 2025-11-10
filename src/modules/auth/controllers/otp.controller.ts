import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from '../services/otp.service';
import { LoginService } from '../services/login.service';
import { LoginStartDto } from '../dtos/login-start.dto';
import { VerifyOtpDto } from '../dtos/login-verify.dto';

@Controller('auth/login')
export class OtpController {
  constructor(
    private readonly otp: OtpService,
    private readonly login: LoginService,
  ) {}

  /** Шаг 1: запросить OTP (код уходит по SMS/Email/Telegram — пока console.log) */
  @Post('start')
  async start(@Body() dto: LoginStartDto) {
    return this.otp.start(dto.identifier);
  }

  /** Шаг 2: подтвердить OTP и выдать токены */
  @Post('verify')
  async verify(@Body() dto: VerifyOtpDto) {
    const { identifier } = await this.otp.verify(dto.otpId, dto.code);
    return this.login.completeOtpLogin({ identifier });
  }
}
