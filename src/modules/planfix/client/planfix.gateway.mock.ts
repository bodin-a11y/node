// src/modules/planfix/client/planfix.gateway.mock.ts

import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { IPlanfixGateway } from './planfix.gateway';
import {
  BonusEvent,
  Contact,
  CreateWarrantyReq,
  FindContactByEmailReq,
  FindContactByPhoneReq,
  FindContactRes,
  FindWarrantyByQrRes,
  LinkContactReq,
  UpsertContactReq,
  Warranty,
  WarrantyNotFoundError,
} from './planfix.types';

type MockDb = {
  warranties: Warranty[];
  bonuses: BonusEvent[];
  contacts: Contact[];
};

const DEFAULT_DB_JSON = '{"warranties":[],"bonuses":[],"contacts":[]}';

@Injectable()
export class PlanfixGatewayMock extends IPlanfixGateway {
  /** Путь к JSON-файлу с "базой" */
  private get dbPath(): string {
    const cfg = process.env.PLANFIX_MOCK_DB?.trim();
    const p = cfg && cfg.length > 0 ? cfg : path.join(process.cwd(), 'seed', 'planfix.mock.json');
    return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
  }

  private async ensureFile(): Promise<void> {
    try {
      await fs.access(this.dbPath);
    } catch {
      const dir = path.dirname(this.dbPath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(this.dbPath, DEFAULT_DB_JSON, 'utf8');
    }
  }

  private async read(): Promise<MockDb> {
    await this.ensureFile();
    try {
      const raw = await fs.readFile(this.dbPath, 'utf8');
      return JSON.parse(raw) as MockDb;
    } catch {
      await fs.writeFile(this.dbPath, DEFAULT_DB_JSON, 'utf8');
      return JSON.parse(DEFAULT_DB_JSON) as MockDb;
    }
  }

  private async write(db: MockDb): Promise<void> {
    await this.ensureFile();
    await fs.writeFile(this.dbPath, JSON.stringify(db, null, 2), 'utf8');
  }

  // ---------- CONTACTS (для auth) ----------

  /** Найти контакт по телефону */
  async findContactByPhone(dto: FindContactByPhoneReq): Promise<FindContactRes> {
    const db = await this.read();
    const norm = dto.phone?.trim();
    const contact = db.contacts.find((c) => c.phone?.trim() === norm);
    return { contact };
  }

  /** Найти контакт по email */
  async findContactByEmail(dto: FindContactByEmailReq): Promise<FindContactRes> {
    const db = await this.read();
    const norm = dto.email?.trim().toLowerCase();
    const contact = db.contacts.find((c) => c.email?.trim().toLowerCase() === norm);
    return { contact };
  }

  /** Найти или создать контакт (по phone/email) */
  async upsertContact(dto: UpsertContactReq): Promise<Contact> {
    const db = await this.read();

    const phoneNorm = dto.phone?.trim();
    const emailNorm = dto.email?.trim()?.toLowerCase();

    let existing: Contact | undefined;
    if (phoneNorm) {
      existing = db.contacts.find((c) => c.phone?.trim() === phoneNorm);
    }
    if (!existing && emailNorm) {
      existing = db.contacts.find((c) => c.email?.trim()?.toLowerCase() === emailNorm);
    }

    if (existing) {
      // Обновляем поля, если пришли новые значения
      existing.name = dto.name ?? existing.name;
      existing.phone = phoneNorm ?? existing.phone;
      existing.email = emailNorm ?? existing.email;
      await this.write(db);
      return existing;
    }

    const created: Contact = {
      id: randomUUID(),
      name: dto.name,
      phone: phoneNorm,
      email: emailNorm,
    };
    db.contacts.push(created);
    await this.write(db);
    return created;
  }

  // ---------- WARRANTY ----------

  /** Найти гарантийный талон по QR-коду */
  async findWarrantyByQr(qr: string): Promise<FindWarrantyByQrRes> {
    const db = await this.read();
    const warranty = db.warranties.find((w) => w.qr === qr);
    return { warranty };
  }

  /** Создать новый гарантийный талон (идемпотентно по qr) */
  async createWarranty(dto: CreateWarrantyReq): Promise<Warranty> {
    const db = await this.read();

    const exists = db.warranties.find((w) => w.qr === dto.qr);
    if (exists) return exists;

    const created: Warranty = {
      id: randomUUID(),
      qr: dto.qr,
      status: 'draft',            
      createdAt: new Date().toISOString(),
    };
    

    db.warranties.push(created);
    await this.write(db);
    return created;
  }

  /** Привязка контакта — общая реализация */
  private async link(
    role: 'buyer' | 'seller' | 'installer',
    { warrantyId, contactId }: LinkContactReq,
  ): Promise<Warranty> {
    const db = await this.read();
    const w = db.warranties.find((x) => x.id === warrantyId);
    if (!w) throw new WarrantyNotFoundError();

    if (role === 'buyer') w.buyerContactId = contactId;
    if (role === 'seller') w.sellerContactId = contactId;
    if (role === 'installer') w.installerContactId = contactId;

    await this.write(db);
    return w;
  }

  async linkBuyer(dto: LinkContactReq): Promise<Warranty> {
    return this.link('buyer', dto);
  }
  async linkSeller(dto: LinkContactReq): Promise<Warranty> {
    return this.link('seller', dto);
  }
  async linkInstaller(dto: LinkContactReq): Promise<Warranty> {
    return this.link('installer', dto);
  }

  /** Обновить статус гарантийного талона */
  async updateWarrantyStatus(id: string, status: Warranty['status']): Promise<Warranty> {
    const db = await this.read();
    const w = db.warranties.find((x) => x.id === id);
    if (!w) throw new WarrantyNotFoundError();
    w.status = status;
    await this.write(db);
    return w;
  }

  /** Удалить гарантийный талон */
  async deleteWarranty(id: string): Promise<boolean> {
    const db = await this.read();
    const before = db.warranties.length;
    db.warranties = db.warranties.filter((w) => w.id !== id);
    const changed = db.warranties.length !== before;

    // опционально чистим бонусы, связанные с талоном
    if (changed) {
      db.bonuses = db.bonuses.filter((b) => b.warrantyId !== id);
      await this.write(db);
    } else {
      await this.write(db);
    }

    return changed;
  }

  // ---------- BONUS ----------

  /** Проверить существование бонуса по eventId (идемпотентность) */
  async hasBonus(eventId: string): Promise<boolean> {
    const db = await this.read();
    return db.bonuses.some((b) => b.id === eventId);
  }
  async findContactBySellerCode(dto: { sellerCode: string }): Promise<FindContactRes> {
    const db = await this.read();
    const code = dto.sellerCode.trim();
    const contact = db.contacts.find(c => (c.sellerCode ?? '').trim() === code);
    return { contact };
  }
  async updateContact(dto: { id: string; phone?: string; email?: string; name?: string; sellerCode?: string }): Promise<Contact> {
    const db = await this.read();
    const c = db.contacts.find(x => x.id === dto.id);
    if (!c) throw new Error('contact_not_found');
    if (dto.phone !== undefined) c.phone = dto.phone?.trim();
    if (dto.email !== undefined) c.email = dto.email?.trim()?.toLowerCase();
    if (dto.name  !== undefined) c.name  = dto.name;
    if (dto.sellerCode !== undefined) c.sellerCode = dto.sellerCode?.trim();
    await this.write(db);
    return c;
  }

  /** Добавить бонусное событие, если его ещё нет */
  async addBonus(ev: Omit<BonusEvent, 'createdAt'>): Promise<BonusEvent> {
    const db = await this.read();
    const existing = db.bonuses.find((b) => b.id === ev.id);
    if (existing) return existing;

    const saved: BonusEvent = { ...ev, createdAt: new Date().toISOString() };
    db.bonuses.push(saved);
    await this.write(db);
    return saved;
  }
}
