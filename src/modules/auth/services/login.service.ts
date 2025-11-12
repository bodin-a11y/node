import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service';
import { UserIdentity } from '../types/auth.types';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from '../dtos/admin-login.dto';

// Новый импорт: единый интерфейс Planfix
import { IPlanfixGateway } from '../../planfix/client/planfix.gateway';

@Injectable()
export class LoginService {
  constructor(
    private readonly tokens: TokenService,
    private readonly adminAuth: AdminAuthService,
    private readonly planfix: IPlanfixGateway, // <-- инжектим единый гейтвей
  ) {}

  /**
   * Завершение OTP-флоу (seller/installer).
   * Ищем контакт в Planfix (мок/реал), при необходимости создаём (по флагу),
   * затем выпускаем токены с ролью:
   *  - email  => seller
   *  - phone  => installer
   */
  async completeOtpLogin(params: { identifier: string }) {
    const identifier = params.identifier?.trim();
    if (!identifier) {
      throw new UnauthorizedException('Identifier is required');
    }

    const isEmail = this.isEmail(identifier);
    const autoCreate = (process.env.AUTH_CONTACT_AUTO_CREATE ?? 'true').toLowerCase() === 'true';

    // 1) Пытаемся найти контакт
    const found = isEmail
      ? await this.planfix.findContactByEmail({ email: identifier })
      : await this.planfix.findContactByPhone({ phone: this.normalizePhone(identifier) });

    // 2) Если не нашли — по политике autoCreate создаём/или запрещаем вход
    const contact =
      found.contact ??
      (autoCreate
        ? await this.planfix.upsertContact(
            isEmail
              ? { email: identifier, name: identifier }
              : { phone: this.normalizePhone(identifier), name: identifier },
          )
        : null);

    if (!contact) {
      throw new UnauthorizedException('User not found in Planfix');
    }

    // 3) Определяем роль (временно по типу идентификатора; позже заменим на реальную логику)
    const roles: UserIdentity['roles'] = isEmail ? ['seller'] : ['installer'];

    // 4) Собираем UserIdentity
    const user: UserIdentity = {
      id: contact.id, // храним планфикс-id контакта как идентификатор пользователя
      roles,
      displayName: contact.name ?? identifier,
      // опционально можно вернуть email/phone (если есть поля в UserIdentity)
      // email: contact.email,
      // phone: contact.phone,
    };

    // 5) Токены
    const { accessToken, refreshToken } = this.tokens.issueTokens(user);
    return { accessToken, refreshToken, user };
  }

  /**
   * Парольный вход администратора (локальная база).
   */
  async loginAdminWithPassword(dto: AdminLoginDto) {
    const admin = await this.adminAuth.verifyAndGetUser(dto);
    const { accessToken, refreshToken } = this.tokens.issueTokens(admin);
    return { accessToken, refreshToken, user: admin };
  }

  // ----------------- helpers -----------------

  private isEmail(s: string): boolean {
    // очень простой чек; при необходимости ужесточим
    return /\S+@\S+\.\S+/.test(s);
  }

  private normalizePhone(s: string): string {
    // оставляем + и цифры, убираем остальное
    const cleaned = s.replace(/[^\d+]/g, '');
    // если начинается не с + и похоже на украинский номер — можно префиксовать +380 (не делаем по умолчанию)
    return cleaned;
  }
}
