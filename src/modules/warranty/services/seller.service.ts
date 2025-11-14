import { Injectable, BadRequestException } from '@nestjs/common';
import { IPlanfixGateway } from '../../planfix/client/planfix.gateway';

@Injectable()
export class SellerService {
  constructor(private readonly pf: IPlanfixGateway) {}

  /**
   * Привязать продавца к гарантийному талону и,
   * при необходимости, перевести статус в 'pending_activation'.
   *
   * Логика:
   * 1) Проверяем талон (findWarrantyByQr)
   * 2) Если истёк → ошибка
   * 3) Привязываем продавца (linkSeller)
   * 4) Если статус был draft/null → ставим pending_activation
   */
  async attachSellerToWarranty(
    warrantyId: string,
    sellerContactId: string,
  ): Promise<{
    warranty: any;
    status: string | null;
  }> {
    if (!warrantyId) {
      throw new BadRequestException('warrantyId обязателен');
    }
    if (!sellerContactId) {
      throw new BadRequestException('sellerContactId обязателен');
    }

    // 1) Получаем талон
    const res: any = await this.pf.findWarrantyByQr(warrantyId);
    const warranty: any = res?.warranty ?? res;

    if (!warranty) {
      throw new BadRequestException('Гарантийный талон не найден');
    }

    const currentStatus: string | null = warranty.status ?? null;

    if (currentStatus === 'expired') {
      throw new BadRequestException(
        'Срок действия этого гарантийного талона истёк',
      );
    }

    // 2) Привязываем продавца
    await this.pf.linkSeller({
      warrantyId: warranty.id ?? warrantyId,
      contactId: sellerContactId,
    });

    // 3) Обновляем статус, если черновик
    let nextStatus = currentStatus;
    let updatedWarranty = warranty;

    if (!currentStatus || currentStatus === 'draft') {
      nextStatus = 'pending_activation';
      updatedWarranty = await this.pf.updateWarrantyStatus(
        warranty.id ?? warrantyId,
        'pending_activation',
      );
    }

    return {
      warranty: updatedWarranty,
      status: nextStatus,
    };
  }

  /**
   * Оформить возврат:
   * - если талон в 'pending_activation' → вернуть в 'draft';
   * - если уже 'active' → запретить возврат;
   * - если 'draft' → просто вернуть как есть.
   */
  async returnWarranty(warrantyId: string): Promise<{
    warranty: any;
    status: string | null;
  }> {
    if (!warrantyId) {
      throw new BadRequestException('warrantyId обязателен');
    }

    const res: any = await this.pf.findWarrantyByQr(warrantyId);
    const warranty: any = res?.warranty ?? res;

    if (!warranty) {
      throw new BadRequestException('Гарантийный талон не найден');
    }

    const currentStatus: string | null = warranty.status ?? null;

    if (currentStatus === 'active') {
      throw new BadRequestException(
        'Нельзя оформить возврат для уже активного гарантийного талона',
      );
    }

    // Если уже draft — просто возвращаем как есть
    if (!currentStatus || currentStatus === 'draft') {
      return {
        warranty,
        status: 'draft',
      };
    }

    // Если pending_activation → откатываем в draft
    const updatedWarranty = await this.pf.updateWarrantyStatus(
      warranty.id ?? warrantyId,
      'draft',
    );

    return {
      warranty: updatedWarranty,
      status: 'draft',
    };
  }
}
