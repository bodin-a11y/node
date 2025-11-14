// src/modules/planfix/client/planfix.gateway.real.ts

import { Injectable } from '@nestjs/common';
import { IPlanfixGateway } from './planfix.gateway';
import {
  BonusEvent,
  Contact,
  CreateWarrantyReq,
  FindContactByEmailReq,
  FindContactByPhoneReq,
  FindContactBySellerCodeReq,
  FindContactRes,
  FindWarrantyByQrRes,
  LinkContactReq,
  UpsertContactReq,
  UpdateContactReq,
  Warranty,
  WarrantyStatus,
} from './planfix.types';

/**
 * Реальная интеграция с Planfix.
 *
 * Сейчас это только каркас с заглушками.
 * Когда начальник даст схему/эндпоинты Planfix:
 *  - сюда добавим HttpClient (axios/fetch или Nest HttpService),
 *  - реализуем реальные REST-запросы.
 */
@Injectable()
export class PlanfixGatewayReal extends IPlanfixGateway {
  // Пример заготовки под HTTP-клиент:
  //
  // private readonly baseUrl = process.env.PLANFIX_BASE_URL!;
  // private readonly token = process.env.PLANFIX_API_TOKEN!;
  //
  // private async request<T>(method: 'GET' | 'POST', url: string, body?: any): Promise<T> {
  //   // TODO: реализовать реальный HTTP-клиент (fetch/axios/HttpService)
  // }

  // ---------- CONTACTS (для auth/warranty) ----------

  /** Найти контакт по телефону */
  async findContactByPhone(_dto: FindContactByPhoneReq): Promise<FindContactRes> {
    throw new Error('PlanfixGatewayReal.findContactByPhone: Not implemented yet');
  }

  /** Найти контакт по email */
  async findContactByEmail(_dto: FindContactByEmailReq): Promise<FindContactRes> {
    throw new Error('PlanfixGatewayReal.findContactByEmail: Not implemented yet');
  }

  /** Найти или создать контакт (по phone/email) */
  async upsertContact(_dto: UpsertContactReq): Promise<Contact> {
    throw new Error('PlanfixGatewayReal.upsertContact: Not implemented yet');
  }

  /** Найти контакт по sellerCode (код дилера/продавца) */
  async findContactBySellerCode(_dto: FindContactBySellerCodeReq): Promise<FindContactRes> {
    throw new Error('PlanfixGatewayReal.findContactBySellerCode: Not implemented yet');
  }

  /** Обновить контакт (частично) */
  async updateContact(_dto: UpdateContactReq): Promise<Contact> {
    throw new Error('PlanfixGatewayReal.updateContact: Not implemented yet');
  }

  // ---------- WARRANTY (гарантийные талоны) ----------

  /** Найти гарантийный талон по QR-коду */
  async findWarrantyByQr(_qr: string): Promise<FindWarrantyByQrRes> {
    throw new Error('PlanfixGatewayReal.findWarrantyByQr: Not implemented yet');
  }

  /**
   * Создать новый гарантийный талон.
   *
   * В боевой схеме талоны, скорее всего, будут создаваться
   * на стороне Planfix (вручную или автоматом), и этот метод
   * может вообще не использоваться нашим backend.
   */
  async createWarranty(_dto: CreateWarrantyReq): Promise<Warranty> {
    throw new Error('PlanfixGatewayReal.createWarranty: Not implemented yet');
  }

  /** Привязать покупателя к гарантийному талону */
  async linkBuyer(_dto: LinkContactReq): Promise<Warranty> {
    throw new Error('PlanfixGatewayReal.linkBuyer: Not implemented yet');
  }

  /** Привязать продавца к гарантийному талону */
  async linkSeller(_dto: LinkContactReq): Promise<Warranty> {
    throw new Error('PlanfixGatewayReal.linkSeller: Not implemented yet');
  }

  /** Привязать монтажника к гарантийному талону */
  async linkInstaller(_dto: LinkContactReq): Promise<Warranty> {
    throw new Error('PlanfixGatewayReal.linkInstaller: Not implemented yet');
  }

  /** Обновить статус гарантийного талона */
  async updateWarrantyStatus(_id: string, _status: WarrantyStatus): Promise<Warranty> {
    throw new Error('PlanfixGatewayReal.updateWarrantyStatus: Not implemented yet');
  }

  /** Удалить гарантийный талон */
  async deleteWarranty(_id: string): Promise<boolean> {
    throw new Error('PlanfixGatewayReal.deleteWarranty: Not implemented yet');
  }

  // ---------- BONUS (для бонусной системы) ----------

  /** Проверить, есть ли уже бонусное событие (по eventId) */
  async hasBonus(_eventId: string): Promise<boolean> {
    throw new Error('PlanfixGatewayReal.hasBonus: Not implemented yet');
  }

  /** Добавить бонусное событие (если его нет) */
  async addBonus(_ev: Omit<BonusEvent, 'createdAt'>): Promise<BonusEvent> {
    throw new Error('PlanfixGatewayReal.addBonus: Not implemented yet');
  }
}
