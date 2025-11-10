import { Injectable } from '@nestjs/common';
import { TokenService } from './token.service';
import { UserIdentity } from '../types/auth.types';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from '../dtos/admin-login.dto';
// Когда появятся реальные маршруты в Planfix — раскомментируй:
// import { PlanfixGateway } from './planfix.gateway';

@Injectable()
export class LoginService {
  constructor(
    private readonly tokens: TokenService,
    private readonly adminAuth: AdminAuthService,
    // private readonly planfix: PlanfixGateway,
  ) {}

  /**
   * Завершение OTP-флоу (seller/installer):
   *  - Проверяем пользователя в Planfix (позже)
   *  - Собираем UserIdentity
   *  - Выдаём access/refresh
   */
  async completeOtpLogin(params: { identifier: string }) {
    // TODO: заменить mock на реальный Planfix-поиск:
    // const contact = await this.planfix.findContactByIdentifier(params.identifier, undefined);
    // if (!contact) throw new UnauthorizedException('User not found in Planfix');
    // const roles = await this.planfix.getContactRoles(contact.id);

    const mockUser: UserIdentity = {
      id: `u_${Buffer.from(params.identifier).toString('hex')}`,
      roles: params.identifier.includes('@') ? ['seller'] : ['installer'],
      displayName: params.identifier,
      // planfixContactId: contact.id,
    };

    const { accessToken, refreshToken } = this.tokens.issueTokens(mockUser);
    return { accessToken, refreshToken, user: mockUser };
  }

  /**
   * Парольный вход администратора.
   */
  async loginAdminWithPassword(dto: AdminLoginDto) {
    const admin = await this.adminAuth.verifyAndGetUser(dto);
    const { accessToken, refreshToken } = this.tokens.issueTokens(admin);
    return { accessToken, refreshToken, user: admin };
  }
}
