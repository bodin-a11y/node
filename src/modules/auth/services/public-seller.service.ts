// Бизнес-логика публичной регистрации продавца.
// Здесь ничего не знаем о транспортном слое (HTTP). Всё, что связано с Planfix,
// делегируем gateway-слою (PlanfixGateway).

import { Injectable } from '@nestjs/common';
import { RegisterSellerDto } from '../dto/register-seller.dto';
import { PlanfixGateway } from './planfix.gateway';
import { randomUUID } from 'crypto';

@Injectable()
export class PublicSellerService {
  constructor(private readonly planfix: PlanfixGateway) {}

  /**
   * Создание заявки в Planfix:
   *  - проверяем согласие
   *  - валидируем дилера по dealerCode
   *  - проверяем, нет ли уже pending заявки (email + dealerId)
   *  - создаём новую задачу "Registration: Seller (pending)" c ticketId + eventId
   */
  async createRegistration(dto: RegisterSellerDto) {
    if (!dto.consent) {
      // бросаем объект-исключение в формате общего фильтра ошибок (HttpExceptionFilter)
      throw { code: 'CONSENT_REQUIRED', message: 'Consent is required', httpStatus: 400 };
    }

    const dealer = await this.planfix.findDealerByCode(dto.dealerCode);
    if (!dealer) {
      throw { code: 'DEALER_CODE_INVALID', message: 'Dealer code not found', httpStatus: 400 };
    }

    // Дедупликация: если уже есть "ожидающая" заявка на того же email у того же дилера — возвращаем её ticketId
    const existing = await this.planfix.findPendingSellerTicket(dto.email, dealer.id);
    if (existing) {
      return { ticketId: existing.ticketId, status: 'pending' as const };
    }

    const ticketId = randomUUID(); // ID заявки, хранится у нас и в Planfix
    const eventId = randomUUID();  // для идемпотентности при вебхуках

    await this.planfix.createSellerRegistrationTask({
      ticketId,
      eventId,
      dealerId: dealer.id,
      dealerCode: dto.dealerCode,
      sellerName: dto.name,
      sellerEmail: dto.email,
      sellerPhone: dto.phone,
    });

    // здесь можно отправить уведомление (email/telegram) "заявка принята"
    return { ticketId, status: 'pending' as const };
  }

  /** Вернуть статус заявки из Planfix по ticketId (pending/approved/rejected) */
  async getRegistrationStatus(ticketId: string) {
    const status = await this.planfix.getSellerRegistrationStatus(ticketId);
    // если Planfix не вернул — по умолчанию считаем pending
    return status ?? 'pending';
  }

  /**
   * Обработка вебхука Planfix о смене статуса задачи.
   * Вся тяжёлая работа (подпись, идемпотентность, создание контакта) — внутри gateway.
   */
  async handlePlanfixTaskUpdate(payload: any) {
    await this.planfix.processTaskUpdateWebhook(payload);
  }
}
