import { Injectable, BadRequestException } from '@nestjs/common';
import { IPlanfixGateway } from '../../planfix/client/planfix.gateway';
import { BuyerRegistrationDto } from '../dtos/buyer-registration.dto';

@Injectable()
export class BuyerService {
  constructor(private readonly pf: IPlanfixGateway) {}

  /**
   * Найти/создать контакт покупателя и (опционально) привязать к талону.
   *
   * Используется:
   * - отдельно (ensure)
   * - внутри активации талона (activate)
   */
  async ensureBuyer(
    dto: BuyerRegistrationDto & { warrantyId?: string },
  ): Promise<{ contact: any }> {
    if (!dto.phone && !dto.email) {
      throw new BadRequestException(
        'Нужно указать хотя бы телефон или email покупателя',
      );
    }

    const contact = dto.contactId
      ? await this.pf.updateContact({
          id: dto.contactId,
          name: dto.name,
          phone: dto.phone,
          email: dto.email,
        })
      : await this.pf.upsertContact({
          phone: dto.phone,
          email: dto.email,
          name: dto.name,
        });

    // Если передали warrantyId — сразу привязываем покупателя к талону
    if (dto.warrantyId) {
      await this.pf.linkBuyer({
        warrantyId: dto.warrantyId,
        contactId: contact.id,
      });
    }

    return { contact };
  }

  /**
   * Проверка талона перед активацией.
   *
   * По warrantyId (строка из QR) возвращает:
   * - статус;
   * - активирован ли уже;
   * - просрочен ли.
   *
   * Используем существующий метод findWarrantyByQr.
   */
  async checkWarrantyForBuyer(warrantyId: string): Promise<{
    warrantyId: string;
    status: string | null;
    isActivated: boolean;
    isExpired: boolean;
    buyerContactId: string | null;
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
    const buyerContactId: string | null =
      warranty.buyerContactId ?? warranty.buyer_id ?? null;

    const isActivated =
      Boolean(buyerContactId) || status === 'active';
    const isExpired = status === 'expired';

    return {
      warrantyId: warranty.id ?? warrantyId,
      status,
      isActivated,
      isExpired,
      buyerContactId,
      raw: warranty,
    };
  }

  /**
   * "Активация" гарантийного талона покупателем.
   *
   * По факту:
   * - создаём/обновляем данные покупателя;
   * - привязываем покупателя к талону;
   * - если талон был в статусе draft (или без статуса) — переводим в pending_activation
   *   (начинается 14-дневный период возврата);
   * - если статус уже pending_activation — просто дополняем данными покупателя.
   *
   * Перевод в active и начисление бонуса делает Planfix/n8n по таймеру.
   */
  async activateWarrantyForBuyer(
    dto: BuyerRegistrationDto & { warrantyId: string },
  ): Promise<{
    contact: any;
    warranty: any;
    status: string | null;
  }> {
    if (!dto.warrantyId) {
      throw new BadRequestException('warrantyId обязателен');
    }

    // 1) Проверяем текущий статус талона
    const check = await this.checkWarrantyForBuyer(dto.warrantyId);

    if (check.isExpired) {
      throw new BadRequestException(
        'Срок действия этого гарантийного талона истёк',
      );
    }

    if (check.status === 'active') {
      // Талон уже полностью активирован (14 дней прошли, бонус начислен)
      throw new BadRequestException(
        'Этот гарантийный талон уже полностью активирован',
      );
    }

    // 2) Создаём/обновляем покупателя и привязываем его к талону
    const { contact } = await this.ensureBuyer(dto);

    // 3) Если талон был черновиком — переводим в pending_activation.
    //    Если уже pending_activation — оставляем как есть.
    let nextStatus = check.status;
    let warranty = check.raw;

    if (!check.status || check.status === 'draft') {
      nextStatus = 'pending_activation';
      warranty = await this.pf.updateWarrantyStatus(
        dto.warrantyId,
        'pending_activation',
      );
    }

    return {
      contact,
      warranty,
      status: nextStatus,
    };
  }
}
