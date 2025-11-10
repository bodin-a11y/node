import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { RegisterSellerDto } from '../dtos/register-seller.dto';
import { RegisterInstallerDto } from '../dtos/register-installer.dto';

export interface PlanfixContact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  sellerCode?: string;     // кастомное поле
  linkedSellerId?: string; // связь монтажника с продавцом
}

@Injectable()
export class PlanfixGateway {
  private readonly logger = new Logger(PlanfixGateway.name);
  private readonly http: AxiosInstance;
  private readonly base = process.env.PLANFIX_BASE_URL ?? '';
  private readonly token = process.env.PLANFIX_API_TOKEN ?? '';

  constructor() {
    this.http = axios.create({
      baseURL: this.base,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.token ? `Bearer ${this.token}` : undefined,
      },
    });
  }

  /**
   * Поиск контакта по телефону и/или email.
   * TODO: заменить мок на реальный вызов Planfix (search contacts).
   */
  async findContactByIdentifier(phone?: string, email?: string): Promise<PlanfixContact | null> {
    try {
      // Пример (псевдо):
      // const { data } = await this.http.get('/contacts', { params: { phone, email } });
      // if (!data?.items?.length) return null;
      // const c = data.items[0];
      // return this.mapContact(c);

      return null; // мок до подключения API
    } catch (e) {
      this.logger.warn(`findContactByIdentifier failed: ${String(e)}`);
      return null;
    }
  }

  /**
   * Найти продавца по его sellerCode (кастомное поле).
   * TODO: заменить мок на реальный поиск по custom field.
   */
  async findSellerByCode(code: string): Promise<PlanfixContact | null> {
    try {
      // Пример (псевдо):
      // const { data } = await this.http.get('/contacts', { params: { customField: 'sellerCode', value: code }});
      // if (!data?.items?.length) return null;
      // return this.mapContact(data.items[0]);
      return null;
    } catch (e) {
      this.logger.warn(`findSellerByCode failed: ${String(e)}`);
      return null;
    }
  }

  /**
   * Создать продавца. Генерируем sellerCode на нашей стороне — либо просим Planfix хранить/генерить.
   * TODO: заменить мок на реальный POST в Planfix.
   */
  async createSeller(dto: RegisterSellerDto): Promise<PlanfixContact> {
    try {
      const sellerCode = 'S-' + Math.floor(100000 + Math.random() * 900000);

      // Пример (псевдо):
      // const payload = { name: dto.name, phone: dto.phone, email: dto.email, customFields: { sellerCode, company: dto.company } };
      // const { data } = await this.http.post('/contacts', payload);
      // return this.mapContact(data);

      return {
        id: 'pf_' + Math.random().toString(36).slice(2),
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        sellerCode,
      };
    } catch (e) {
      this.logger.error(`createSeller failed: ${String(e)}`);
      // В реальной реализации бросай HttpException с деталями ответа PF
      throw e;
    }
  }

  /**
   * Создать монтажника и связать с продавцом (linkedSellerId).
   * TODO: заменить мок на реальный POST + связь/relationship в Planfix.
   */
  async createInstaller(dto: RegisterInstallerDto & { sellerId: string }): Promise<PlanfixContact> {
    try {
      // Пример (псевдо):
      // const payload = { name: dto.name, phone: dto.phone, relations: [{ type: 'linkedSeller', toId: dto.sellerId }] };
      // const { data } = await this.http.post('/contacts', payload);
      // return this.mapContact(data);

      return {
        id: 'pf_' + Math.random().toString(36).slice(2),
        name: dto.name,
        phone: dto.phone,
        linkedSellerId: dto.sellerId,
      };
    } catch (e) {
      this.logger.error(`createInstaller failed: ${String(e)}`);
      throw e;
    }
  }

  // Если понадобится нормализатор ответа PF — добавь тут:
  // private mapContact(raw: any): PlanfixContact { ... }
}
