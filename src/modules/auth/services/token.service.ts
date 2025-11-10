import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Response, Request } from 'express';
import { UserIdentity } from '../types/auth.types';

@Injectable()
export class TokenService {
  private ACCESS_TTL = process.env.JWT_ACCESS_TTL ?? '15m';
  private REFRESH_TTL = process.env.JWT_REFRESH_TTL ?? '30d';
  private COOKIE_NAME = process.env.JWT_REFRESH_COOKIE_NAME ?? 'rt';

  constructor(private readonly jwt: JwtService) {}

  /**
   * Выпуск пары токенов. Access — короткий (для заголовка Authorization),
   * Refresh — длинный (для ротации, хранится в HttpOnly-куке).
   */
  issueTokens(user: UserIdentity) {
    const payload = { sub: user.id, roles: user.roles, pfcid: user.planfixContactId };
    const accessToken = this.jwt.sign(payload, { expiresIn: this.ACCESS_TTL });
    const refreshToken = this.jwt.sign({ sub: user.id }, { expiresIn: this.REFRESH_TTL });
    return { accessToken, refreshToken };
  }

  /** Установить refresh в HttpOnly-куку (зови в контроллере после логина) */
  setRefreshCookie(res: Response, token: string) {
    res.cookie(this.COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: this.parseMaxAge(this.REFRESH_TTL),
      path: '/auth',
    });
  }

  /** Очистить refresh-куку (logout) */
  clearRefreshCookie(res: Response) {
    res.clearCookie(this.COOKIE_NAME, { path: '/auth' });
  }

  /**
   * (Опционально) Прочитать refresh из куки запроса.
   * Полезно для эндпоинта /auth/refresh.
   */
  readRefreshFromCookie(req: Request): string | null {
    // зависит от middleware cookie-parser
    // app.use(cookieParser());
    const token = (req as any).cookies?.[this.COOKIE_NAME];
    return token || null;
  }

  /**
   * (Опционально) Провалидировать refresh и выдать новый access.
   * Здесь же можно делать ротацию refresh и проверку blacklist-хэша, если добавишь.
   */
  rotateAccessFromRefresh(refreshToken: string) {
    try {
      const decoded = this.jwt.verify(refreshToken) as { sub: string };
      const accessToken = this.jwt.sign({ sub: decoded.sub }, { expiresIn: this.ACCESS_TTL });
      return { accessToken };
    } catch {
      return null;
    }
  }

  private parseMaxAge(ttl: string): number {
    // поддержка форматов '30d', '15m', '3600' (сек)
    const m = /^(\d+)([smhd])?$/.exec(ttl);
    if (!m) return 30 * 24 * 3600 * 1000; // дефолт 30d
    const num = Number(m[1]);
    const unit = m[2] ?? 's';
    const mult = unit === 's' ? 1000 : unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;
    return num * mult;
  }
}
