// src/modules/auth/services/registration.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { RegisterSellerDto } from '../dtos/register-seller.dto';
import { RegisterInstallerDto } from '../dtos/register-installer.dto';
import { TokenService } from './token.service';
import { UserIdentity } from '../types/auth.types';
import { IPlanfixGateway } from '../../planfix/client/planfix.gateway';

@Injectable()
export class RegistrationService {
  constructor(
    private readonly planfix: IPlanfixGateway,
    private readonly tokens: TokenService,
  ) {}

  /** Регистрация продавца в Planfix + сразу выдаём токены */
  async registerSeller(dto: RegisterSellerDto) {
    const phone = dto.phone?.trim();
    const email = dto.email?.trim()?.toLowerCase();

    // 1) Проверка дубликатов
    if (phone) {
      const byPhone = await this.planfix.findContactByPhone({ phone });
      if (byPhone.contact) throw new BadRequestException('User already exists (phone)');
    }
    if (email) {
      const byEmail = await this.planfix.findContactByEmail({ email });
      if (byEmail.contact) throw new BadRequestException('User already exists (email)');
    }

    // 2) Создаём/апдейтим контакт
    const contact = await this.planfix.upsertContact({
      phone,
      email,
      name: dto.name?.trim() || email || phone || 'Seller',
    });

    // 3) Генерируем sellerCode и сохраняем на контакте
    const sellerCode = this.generateSellerCode(contact);
    await this.planfix.updateContact({ id: contact.id, sellerCode });

    // 4) Собираем профиль пользователя
    const user: UserIdentity = {
      id: contact.id,
      roles: ['seller'],
      displayName: contact.name ?? (email || phone || 'Seller'),
    };

    // 5) Токены
    const { accessToken, refreshToken } = this.tokens.issueTokens(user);
    return {
      accessToken,
      refreshToken,
      user,
      meta: { sellerCode },
    };
  }

  /** Регистрация монтажника по sellerCode + сразу выдаём токены */
  async registerInstaller(dto: RegisterInstallerDto) {
    const phone = dto.phone?.trim();
    if (!dto.sellerCode?.trim()) throw new BadRequestException('sellerCode required');

    // 1) Проверяем валидность кода продавца
    const seller = await this.planfix.findContactBySellerCode({ sellerCode: dto.sellerCode.trim() });
    if (!seller.contact) throw new NotFoundException('Seller not found by code');

    // 2) Проверка дубликата по телефону
    if (!phone) throw new BadRequestException('phone required');
    const existing = await this.planfix.findContactByPhone({ phone });
    if (existing.contact) throw new BadRequestException('Installer already exists');

    // 3) Создаём контакт монтажника и сохраняем sellerCode как привязку
    const contact = await this.planfix.upsertContact({
      phone,
      name: dto.name?.trim() || phone || 'Installer',
    });
    await this.planfix.updateContact({ id: contact.id, sellerCode: dto.sellerCode.trim() });

    // 4) Токены
    const user: UserIdentity = {
      id: contact.id,
      roles: ['installer'],
      displayName: contact.name ?? phone,
    };
    const { accessToken, refreshToken } = this.tokens.issueTokens(user);

    return { accessToken, refreshToken, user };
  }

  // ----------------- helpers -----------------

  /** Простой читаемый sellerCode (можешь заменить на свой формат) */
  private generateSellerCode(contact: { id: string }): string {
    // SON-<первые 6 символов id без дефисов>
    const base = contact.id.replace(/-/g, '').slice(0, 6).toUpperCase();
    return `SON-${base}`;
  }
}
