// src/modules/planfix/client/planfix.gateway.ts

import {
  // CONTACTS
  FindContactByPhoneReq,
  FindContactByEmailReq,
  FindContactBySellerCodeReq,
  UpsertContactReq,
  UpdateContactReq,
  FindContactRes,
  Contact,
  // WARRANTY
  FindWarrantyByQrRes,
  CreateWarrantyReq,
  LinkContactReq,
  Warranty,
  WarrantyStatus,
  // BONUS
  BonusEvent,
} from './planfix.types';

/**
 * Единый интерфейс для взаимодействия с Planfix.
 * Все сервисы (auth, warranty, bonus) используют этот слой.
 * Реализация выбирается через ENV: mock или real.
 */
export abstract class IPlanfixGateway {
  // --- CONTACTS (используется в auth/warranty) ---

  /** Найти контакт по телефону */
  abstract findContactByPhone(dto: FindContactByPhoneReq): Promise<FindContactRes>;

  /** Найти контакт по email */
  abstract findContactByEmail(dto: FindContactByEmailReq): Promise<FindContactRes>;

  /** Найти контакт по sellerCode (код дилера/продавца) */
  abstract findContactBySellerCode(dto: FindContactBySellerCodeReq): Promise<FindContactRes>;

  /** Найти или создать контакт (по phone/email) */
  abstract upsertContact(dto: UpsertContactReq): Promise<Contact>;

  /** Обновить контакт (частично) */
  abstract updateContact(dto: UpdateContactReq): Promise<Contact>;

  // --- WARRANTY (используется в warranty) ---

  /** Найти гарантийный талон по QR-коду */
  abstract findWarrantyByQr(qr: string): Promise<FindWarrantyByQrRes>;

  /**
   * Создать новый гарантийный талон.
   *
   * В боевой схеме может не использоваться (талоны создаются в самом Planfix),
   * но для моков/тестов и будущих сценариев оставляем.
   */
  abstract createWarranty(dto: CreateWarrantyReq): Promise<Warranty>;

  /** Привязать покупателя к гарантийному талону */
  abstract linkBuyer(dto: LinkContactReq): Promise<Warranty>;

  /** Привязать продавца к гарантийному талону */
  abstract linkSeller(dto: LinkContactReq): Promise<Warranty>;

  /** Привязать монтажника к гарантийному талону */
  abstract linkInstaller(dto: LinkContactReq): Promise<Warranty>;

  /** Обновить статус гарантийного талона */
  abstract updateWarrantyStatus(id: string, status: WarrantyStatus): Promise<Warranty>;

  /** Удалить гарантийный талон (опционально, для админов) */
  abstract deleteWarranty(id: string): Promise<boolean>;

  // --- BONUS (для бонусной системы) ---

  /** Проверить, есть ли уже бонусное событие (по eventId) */
  abstract hasBonus(eventId: string): Promise<boolean>;

  /** Добавить бонусное событие (если его нет) */
  abstract addBonus(ev: Omit<BonusEvent, 'createdAt'>): Promise<BonusEvent>;
}
