import { Injectable, BadRequestException } from '@nestjs/common';
import { IPlanfixGateway } from '../../planfix/client/planfix.gateway';

interface CompleteInstallationPayload {
  warrantyId: string;
  installerContactId: string;
  installationDate?: string;
  comment?: string;
}

@Injectable()
export class InstallerService {
  constructor(private readonly pf: IPlanfixGateway) {}

  /**
   * Проверка талона со стороны монтажника.
   *
   * По warrantyId (строка из QR) возвращает:
   * - статус;
   * - привязан ли уже монтажник.
   */
  async checkWarrantyForInstaller(warrantyId: string): Promise<{
    warrantyId: string;
    status: string | null;
    hasInstaller: boolean;
    installerContactId: string | null;
    raw: any;
  }> {
    if (!warrantyId) {
      throw new BadRequestException('warrantyId обязателен');
    }

    const res: any = await this.pf.findWarrantyByQr(warrantyId);
    const warranty: any = res?.warranty ?? res;

    if (!warranty) {
      throw new BadRequestException('Гарантийный талон не найден');
    }

    const status: string | null = warranty.status ?? null;
    const installerContactId: string | null =
      warranty.installerContactId ?? warranty.installer_id ?? null;

    const hasInstaller = Boolean(installerContactId);

    return {
      warrantyId: warranty.id ?? warrantyId,
      status,
      hasInstaller,
      installerContactId,
      raw: warranty,
    };
  }

  /**
   * Завершение монтажа:
   * 1) Проверяем талон (не истёк ли).
   * 2) Привязываем монтажника к талону.
   * 3) (опц.) позже можно будет передавать installationDate/comment в Planfix.
   *
   * Статус талона здесь НЕ меняем.
   */
  async completeInstallation(
    payload: CompleteInstallationPayload,
  ): Promise<{
    warranty: any;
    status: string | null;
  }> {
    const { warrantyId, installerContactId } = payload;

    if (!warrantyId) {
      throw new BadRequestException('warrantyId обязателен');
    }
    if (!installerContactId) {
      throw new BadRequestException('installerContactId обязателен');
    }

    // 1) Проверяем талон
    const check = await this.checkWarrantyForInstaller(warrantyId);

    if (check.status === 'expired') {
      throw new BadRequestException(
        'Срок действия этого гарантийного талона истёк',
      );
    }

    // 2) Привязываем монтажника
    const linked = await this.pf.linkInstaller({
      warrantyId: check.warrantyId,
      contactId: installerContactId,
    });

    // 3) На будущее можно добавить сохранение installationDate/comment в Planfix

    return {
      warranty: linked,
      status: linked.status ?? check.status ?? null,
    };
  }
}
