// src/modules/auth/services/admin-auth.service.ts
import { Injectable, UnauthorizedException, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as path from 'path';
import { promises as fsp } from 'fs';
import { AdminLoginDto } from '../dtos/admin-login.dto';
import { UserIdentity } from '../types/auth.types';

interface AdminRecord {
  id: string;
  login: string;
  email: string;
  displayName: string;
  passwordHash: string;
}

@Injectable()
export class AdminAuthService implements OnModuleInit {
  private readonly logger = new Logger(AdminAuthService.name);
  private admins: AdminRecord[] = [];

  /** Путь к JSON с администраторами (можно переопределить через ENV) */
  private get adminsFilePath(): string {
    // По умолчанию кладём в src/modules/auth/data/admins.json в dev
    // и тот же относительный путь с process.cwd() для prod/dist.
    const envPath = process.env.AUTH_ADMINS_FILE?.trim();
    const fallback = path.join('src', 'modules', 'auth', 'data', 'admins.json');
    const p = envPath && envPath.length > 0 ? envPath : fallback;
    return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
  }

  async onModuleInit(): Promise<void> {
    await this.loadAdmins();
  }

  /** Читает файл с администраторами при старте */
  private async loadAdmins(): Promise<void> {
    try {
      const raw = await fsp.readFile(this.adminsFilePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('admins.json must be an array');
      this.admins = parsed;
      this.logger.log(`Loaded ${this.admins.length} admin(s) from ${this.adminsFilePath}`);
    } catch (err) {
      this.logger.warn(
        `Unable to load admins from ${this.adminsFilePath}: ${err instanceof Error ? err.message : String(err)}. Using empty list.`,
      );
      this.admins = [];
    }
  }

  /** Проверяет логин/пароль и возвращает UserIdentity */
  async verifyAndGetUser(dto: AdminLoginDto): Promise<UserIdentity> {
    const admin = this.findAdmin(dto.emailOrLogin);
    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }
    const ok = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: admin.id,
      roles: ['admin'],
      displayName: admin.displayName,
      // полезно иметь под рукой:
      email: admin.email,
      login: admin.login,
    } as UserIdentity;
  }

  /** Ищет админа по email или login */
  private findAdmin(identifier?: string): AdminRecord | null {
    if (!identifier) return null;
    const idNorm = identifier.trim().toLowerCase();
    return (
      this.admins.find(
        (a) => a.login.trim().toLowerCase() === idNorm || a.email.trim().toLowerCase() === idNorm,
      ) || null
    );
  }
}
