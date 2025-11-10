import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { RegisterSellerDto } from '../dtos/register-seller.dto';
import { RegisterInstallerDto } from '../dtos/register-installer.dto';
import { PlanfixGateway } from './planfix.gateway';
import { TokenService } from './token.service';
import { UserIdentity } from '../types/auth.types';

@Injectable()
export class RegistrationService {
  constructor(
    private readonly planfix: PlanfixGateway,
    private readonly tokens: TokenService,
  ) {}

  /** Регистрация продавца в Planfix + сразу выдаём токены */
  async registerSeller(dto: RegisterSellerDto) {
    // 1) проверка дубликатов
    const existing = await this.planfix.findContactByIdentifier(dto.phone, dto.email);
    if (existing) {
      throw new BadRequestException('User already exists');
    }

    // 2) создаём контакт в Planfix
    const contact = await this.planfix.createSeller(dto);

    // 3) собираем профиль пользователя
    const user: UserIdentity = {
      id: contact.id,
      planfixContactId: contact.id,
      roles: ['seller'],
      displayName: contact.name,
    };

    // 4) выдаём токены
    const { accessToken, refreshToken } = this.tokens.issueTokens(user);
    return {
      accessToken,
      refreshToken, // можешь не отдавать на фронт, если ставишь cookie на сервере
      user,
      meta: { sellerCode: contact.sellerCode },
    };
  }

  /** Регистрация монтажника по sellerCode + сразу выдаём токены */
  async registerInstaller(dto: RegisterInstallerDto) {
    // 1) проверяем валидность кода продавца
    const seller = await this.planfix.findSellerByCode(dto.sellerCode);
    if (!seller) {
      throw new NotFoundException('Seller not found by code');
    }

    // 2) проверка дубликатов по телефону
    const existing = await this.planfix.findContactByIdentifier(dto.phone);
    if (existing) {
      throw new BadRequestException('Installer already exists');
    }

    // 3) создаём монтажника и связываем с продавцом
    const contact = await this.planfix.createInstaller({ ...dto, sellerId: seller.id });

    const user: UserIdentity = {
      id: contact.id,
      planfixContactId: contact.id,
      roles: ['installer'],
      displayName: contact.name,
    };

    const { accessToken, refreshToken } = this.tokens.issueTokens(user);
    return {
      accessToken,
      refreshToken,
      user,
    };
  }
}
