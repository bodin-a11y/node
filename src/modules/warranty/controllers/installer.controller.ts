import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { InstallerService } from '../services/installer.service';

@Controller('warranty/installer')
export class InstallerController {
  constructor(private readonly svc: InstallerService) {}

  /**
   * Проверка талона со стороны монтажника.
   *
   * POST /warranty/installer/check
   */
  @Post('check')
  @HttpCode(HttpStatus.OK)
  checkWarranty(
    @Body()
    body: {
      /** ID гарантийного талона / строка из QR */
      warrantyId: string;
    },
  ) {
    return this.svc.checkWarrantyForInstaller(body.warrantyId);
  }

  /**
   * Завершение монтажа (пусконаладка).
   *
   * Монтажник уже существует в системе (auth/Planfix),
   * сюда приходят:
   * - warrantyId
   * - installerContactId (id контакта монтажника в Planfix)
   * - (опц.) дата монтажа, комментарий
   *
   * POST /warranty/installer/complete
   */
  @Post('complete')
  @HttpCode(HttpStatus.OK)
  completeInstallation(
    @Body()
    body: {
      warrantyId: string;
      installerContactId: string;
      installationDate?: string;
      comment?: string;
    },
  ) {
    return this.svc.completeInstallation(body);
  }
}
