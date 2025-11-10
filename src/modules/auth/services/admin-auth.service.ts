import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
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
export class AdminAuthService {
  private admins: AdminRecord[] = [];

  constructor() {
    this.loadAdmins();
  }

  /** Читает файл с администраторами при старте */
  private loadAdmins() {
    try {
      const filePath = path.resolve(__dirname, '../data/admins.json');
      const raw = fs.readFileSync(filePath, 'utf8');
      this.admins = JSON.parse(raw);
      console.log(`[AdminAuth] Loaded ${this.admins.length} admin(s)`);
    } catch (err) {
      console.warn('[AdminAuth] No admins.json found or parse error, using empty list');
      this.admins = [];
    }
  }

  /** Проверяет логин/пароль и возвращает UserIdentity */
  async verifyAndGetUser(dto: AdminLoginDto): Promise<UserIdentity> {
    const admin = this.findAdmin(dto.emailOrLogin);
    if (!admin) throw new UnauthorizedException('Admin not found');

    const ok = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return {
      id: admin.id,
      roles: ['admin'],
      displayName: admin.displayName,
    };
  }

  /** Ищет админа по email или login */
  private findAdmin(identifier?: string): AdminRecord | null {
    if (!identifier) return null;
    const idLower = identifier.toLowerCase();
    return (
      this.admins.find(
        (a) => a.login.toLowerCase() === idLower || a.email.toLowerCase() === idLower,
      ) || null
    );
  }
}
