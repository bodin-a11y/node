import { Body, Controller, Post } from '@nestjs/common';
import { InstallerService } from '../services/installer.service';
import { InstallerRegistrationDto } from '../dtos/installer-registration.dto';

@Controller('warranty/installer')
export class InstallerController {
  constructor(private readonly svc: InstallerService) {}
  @Post('ensure')
  ensure(@Body() dto: InstallerRegistrationDto & { warrantyId?: string }) {
    return this.svc.ensureInstaller(dto);
  }
}
