import { Body, Controller, Post } from '@nestjs/common';
import { RegistrationService } from '../services/registration.service';
import { RegisterSellerDto } from '../dtos/register-seller.dto';
import { RegisterInstallerDto } from '../dtos/register-installer.dto';

@Controller('auth/register')
export class RegistrationController {
  constructor(private readonly registration: RegistrationService) {}

  /** Регистрация продавца в Planfix + сразу выдаём токены */
  @Post('seller')
  registerSeller(@Body() dto: RegisterSellerDto) {
    return this.registration.registerSeller(dto);
  }

  /** Регистрация монтажника по sellerCode + сразу выдаём токены */
  @Post('installer')
  registerInstaller(@Body() dto: RegisterInstallerDto) {
    return this.registration.registerInstaller(dto);
  }
}
