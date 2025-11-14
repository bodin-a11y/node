// src/modules/planfix/client/planfix.types.ts

export type WarrantyStatus =
  | 'draft'              // создан продавцом, но не оформлен
  | 'pending_activation' // покупатель ещё не активировал
  | 'active'             // покупатель активировал
  | 'expired';           // не активирован 14 дней


export interface Warranty {
  id: string;              // Идентификатор сущности в Planfix (напр., taskId)
  qr: string;              // QR-код (уникальный ключ талона)
  status: WarrantyStatus;  // Статус талона
  createdAt: string;       // ISO дата создания

  buyerContactId?: string;     // Связанный покупатель (Planfix contact id)
  sellerContactId?: string;    // Связанный продавец
  installerContactId?: string; // Связанный монтажник
}

export interface Contact {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  sellerCode?: string; // <— добавили поле
}
export interface BonusEvent {
  id: string;           // Идемпотентный ключ события (eventId)
  warrantyId: string;   // Связанный талон
  role: 'seller' | 'installer';
  amount: number;       // Сумма/баллы/единицы бонуса
  createdAt: string;    // ISO дата записи события
}

/** Ответы/запросы для гейтвея */
export interface FindWarrantyByQrRes { warranty?: Warranty }

export interface CreateWarrantyReq {
  qr: string;
  meta?: Record<string, any>; // произвольные дополнительные поля
}

export interface LinkContactReq {
  warrantyId: string;
  contactId: string;
}

/** Ошибки доменного уровня, которые гейтвей может пробрасывать дальше */
export class WarrantyNotFoundError extends Error {
  constructor(message = 'warranty_not_found') {
    super(message);
    this.name = 'WarrantyNotFoundError';
  }
}
// ---- Contacts DTOs ----
export interface FindContactByPhoneReq { phone: string }
export interface FindContactByEmailReq { email: string }
export interface UpsertContactReq {
  phone?: string;
  email?: string;
  name?: string;
}
export interface FindContactRes { contact?: Contact }
export interface FindContactBySellerCodeReq { sellerCode: string }
export interface UpdateContactReq {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  sellerCode?: string;
}
