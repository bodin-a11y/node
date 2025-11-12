// src/modules/auth/services/token.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Response, Request } from 'express';
import { randomUUID } from 'crypto';
import { UserIdentity } from '../types/auth.types';

type SameSiteOpt = 'lax' | 'strict' | 'none';

@Injectable()
export class TokenService {
  private readonly ACCESS_TTL = process.env.JWT_ACCESS_TTL ?? '15m';
  private readonly REFRESH_TTL = process.env.JWT_REFRESH_TTL ?? '30d';
  private readonly COOKIE_NAME = process.env.JWT_REFRESH_COOKIE_NAME ?? 'rt';

  // Куки настраиваем через ENV, чтобы не править код на проде
  private readonly COOKIE_SECURE = (process.env.JWT_COOKIE_SECURE ?? 'true').toLowerCase() === 'true';
  private readonly COOKIE_SAMESITE = (process.env.JWT_COOKIE_SAMESITE ?? 'lax').toLowerCase() as SameSiteOpt;
  private readonly COOKIE_PATH = process.env.JWT_COOKIE_PATH ?? '/auth';
  private readonly COOKIE_DOMAIN = process.env.JWT_COOKIE_DOMAIN; // опционально

  constructor(private readonly jwt: JwtService) {}

  /**
   * Выпуск пары токенов:
   *  - Access: короткий, содержит роли и вспомогательные клеймы.
   *  - Refresh: длинный, хранится в httpOnly-cookie, содержит только sub + версию/идентификатор.
   */
  issueTokens(user: UserIdentity) {
    const accessPayload = this.buildAccessPayload(user);
    const refreshPayload = this.buildRefreshPayload(user);

    const accessToken = this.jwt.sign(accessPayload, { expiresIn: this.ACCESS_TTL });
    const refreshToken = this.jwt.sign(refreshPayload, { expiresIn: this.REFRESH_TTL });

    return {
      accessToken,
      refreshToken,
      meta: {
        accessExpiresIn: this.ACCESS_TTL,
        refreshExpiresIn: this.REFRESH_TTL,
      },
    };
  }

  /** Установить refresh в HttpOnly-куку */
  setRefreshCookie(res: Response, token: string) {
    res.cookie(this.COOKIE_NAME, token, {
      httpOnly: true,
      secure: this.COOKIE_SECURE,
      sameSite: this.COOKIE_SAMESITE,
      maxAge: this.parseMaxAge(this.REFRESH_TTL),
      path: this.COOKIE_PATH,
      ...(this.COOKIE_DOMAIN ? { domain: this.COOKIE_DOMAIN } : {}),
    });
  }

  /** Очистить refresh-куку (logout) */
  clearRefreshCookie(res: Response) {
    res.clearCookie(this.COOKIE_NAME, {
      path: this.COOKIE_PATH,
      ...(this.COOKIE_DOMAIN ? { domain: this.COOKIE_DOMAIN } : {}),
    });
  }

  /** Прочитать refresh из куки запроса (cookie-parser должен быть подключён) */
  readRefreshFromCookie(req: Request): string | null {
    const cookies = (req as any).cookies as Record<string, string> | undefined;
    return cookies?.[this.COOKIE_NAME] ?? null;
  }

  /**
   * Валидация refresh и выпуск нового access.
   * При желании здесь можно:
   *  - проверять jti/версию в сторе (ротация/блоклист),
   *  - выпускать новый refresh и класть его в куку (rotation).
   */
  rotateAccessFromRefresh(refreshToken: string) {
    try {
      const decoded = this.jwt.verify(refreshToken) as { sub: string; ver?: number; jti?: string };
      const accessToken = this.jwt.sign({ sub: decoded.sub }, { expiresIn: this.ACCESS_TTL });
      return { accessToken };
    } catch {
      return null;
    }
  }

  // ---------- helpers ----------

  private buildAccessPayload(user: UserIdentity) {
    const pfcid = (user as any).planfixContactId ?? undefined;
    return {
      sub: user.id,
      roles: user.roles,
      ...(pfcid ? { pfcid } : {}),
    };
  }

  private buildRefreshPayload(user: UserIdentity) {
    // Минимум данных в refresh: subject + версия + уникальный идентификатор
    return {
      sub: user.id,
      ver: 1,          // пригодится для ротации в будущем
      jti: randomUUID()
    };
  }

  private parseMaxAge(ttl: string): number {
    // поддержка '30d', '15m', '12h', '45s' либо '3600' (сек)
    const m = /^(\d+)([smhd])?$/i.exec(ttl.trim());
    if (!m) return 30 * 24 * 3600 * 1000; // дефолт 30d
    const num = Number(m[1]);
    const unit = (m[2] ?? 's').toLowerCase();
    const mult =
      unit === 's' ? 1000 :
      unit === 'm' ? 60_000 :
      unit === 'h' ? 3_600_000 :
      86_400_000; // d
    return num * mult;
  }
}
