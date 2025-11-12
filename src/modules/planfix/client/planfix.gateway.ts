// src/modules/planfix/client/planfix.gateway.ts

import {
    FindWarrantyByQrRes,
    CreateWarrantyReq,
    LinkContactReq,
    Warranty,
    BonusEvent,
    // новые
    FindContactByPhoneReq,
    FindContactByEmailReq,
    UpsertContactReq,
    FindContactRes,
    Contact,
    FindContactBySellerCodeReq,
    UpdateContactReq,
  } from './planfix.types';
  
  /**
   * Единый интерфейс для взаимодействия с Planfix.
   * Все сервисы (auth, warranty, bonus) используют этот слой.
   * Реализация выбирается через ENV: mock или real.
   */
  export abstract class IPlanfixGateway {
    // --- CONTACTS (используется в auth) ---
    /** Найти контакт по телефону */
    abstract findContactByPhone(dto: FindContactByPhoneReq): Promise<FindContactRes>;
  
    /** Найти контакт по email */
    abstract findContactByEmail(dto: FindContactByEmailReq): Promise<FindContactRes>;
  
    /** Найти или создать контакт (по phone/email) */
    abstract upsertContact(dto: UpsertContactReq): Promise<Contact>;
  
    // --- WARRANTY (используется в warranty) ---
    /** Найти гарантийный талон по QR-коду */
    abstract findWarrantyByQr(qr: string): Promise<FindWarrantyByQrRes>;
  
    /** Создать новый гарантийный талон */
    abstract createWarranty(dto: CreateWarrantyReq): Promise<Warranty>;
  
    /** Привязать покупателя к гарантийному талону */
    abstract linkBuyer(dto: LinkContactReq): Promise<Warranty>;
  
    /** Привязать продавца к гарантийному талону */
    abstract linkSeller(dto: LinkContactReq): Promise<Warranty>;
  
    /** Привязать монтажника к гарантийному талону */
    abstract linkInstaller(dto: LinkContactReq): Promise<Warranty>;
  
    /** Обновить статус гарантийного талона */
    abstract updateWarrantyStatus(id: string, status: Warranty['status']): Promise<Warranty>;
  
    /** Удалить гарантийный талон (опционально, для админов) */
    abstract deleteWarranty(id: string): Promise<boolean>;
  
    // --- BONUS (для бонусной системы) ---
    /** Проверить, есть ли уже бонусное событие (по eventId) */
    abstract hasBonus(eventId: string): Promise<boolean>;
        /** Найти контакт по sellerCode */
    abstract findContactBySellerCode(dto: FindContactBySellerCodeReq): Promise<FindContactRes>;

    /** Обновить контакт (частично) */
    abstract updateContact(dto: UpdateContactReq): Promise<Contact>;
  
    /** Добавить бонусное событие (если его нет) */
    abstract addBonus(ev: Omit<BonusEvent, 'createdAt'>): Promise<BonusEvent>;
  }

  