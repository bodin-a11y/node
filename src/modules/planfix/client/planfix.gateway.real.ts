// src/modules/planfix/client/planfix.gateway.real.ts

import { Injectable } from '@nestjs/common';
import { IPlanfixGateway } from './planfix.gateway';
import {
  BonusEvent,
  CreateWarrantyReq,
  FindWarrantyByQrRes,
  LinkContactReq,
  Warranty,
} from './planfix.types';

/**
 * Реальная интеграция с Planfix.
 * TODO: после получения схемы/эндпоинтов перенести сюда логику REST-запросов.
 */
@Injectable()
export class PlanfixGatewayReal extends IPlanfixGateway {
  // Пример: private http = new HttpClient(baseUrl, token) — и т.д.
  // Можно будет подтягивать настройки из config/planfix.config.ts

  async findWarrantyByQr(_qr: string): Promise<FindWarrantyByQrRes> {
    throw new Error('PlanfixGatewayReal.findWarrantyByQr: Not implemented yet');
  }

  async createWarranty(_dto: CreateWarrantyReq): Promise<Warranty> {
    throw new Error('PlanfixGatewayReal.createWarranty: Not implemented yet');
  }

  async linkBuyer(_dto: LinkContactReq): Promise<Warranty> {
    throw new Error('PlanfixGatewayReal.linkBuyer: Not implemented yet');
  }

  async linkSeller(_dto: LinkContactReq): Promise<Warranty> {
    throw new Error('PlanfixGatewayReal.linkSeller: Not implemented yet');
  }

  async linkInstaller(_dto: LinkContactReq): Promise<Warranty> {
    throw new Error('PlanfixGatewayReal.linkInstaller: Not implemented yet');
  }

  async hasBonus(_eventId: string): Promise<boolean> {
    throw new Error('PlanfixGatewayReal.hasBonus: Not implemented yet');
  }

  async addBonus(_ev: Omit<BonusEvent, 'createdAt'>): Promise<BonusEvent> {
    throw new Error('PlanfixGatewayReal.addBonus: Not implemented yet');
  }
}
