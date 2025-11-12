// src/modules/auth/services/otp.service.ts
import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { generateOtp } from '../utils/otp';

/**
 * Простая in-memory реализация OTP.
 * Позже легко заменить Map → Redis, не меняя внешний интерфейс.
 */
type OtpRecord = {
  code: string;
  identifier: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
};

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  /** otpId -> record */
  private store = new Map<string, OtpRecord>();
  /** per-identifier cooldown метки, чтобы не спамили стартами */
  private lastRequestByIdentifier = new Map<string, number>();

  private readonly TTL_MS = Number(process.env.OTP_TTL_MS ?? 5 * 60_000); // 5 мин
  private readonly MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS ?? 5);
  private readonly START_COOLDOWN_MS = Number(process.env.OTP_START_COOLDOWN_MS ?? 30_000); // 30 сек между стартами по одному идентификатору
  private readonly RESEND_COOLDOWN_MS = Number(process.env.OTP_RESEND_COOLDOWN_MS ?? 20_000);
  private readonly MASTER_CODE = process.env.OTP_MASTER_CODE?.trim(); // например, 000000 в DEV
  private readonly CODE_LENGTH = Number(process.env.OTP_CODE_LENGTH ?? 6);

  /**
   * Шаг 1: сгенерировать код и "отправить".
   * Сейчас отправка — в лог; подключи SMS/Email/Telegram позже.
   */
  async start(identifierRaw: string): Promise<{ otpId: string }> {
    const identifier = this.normalizeIdentifier(identifierRaw);
    if (!identifier) throw new BadRequestException('identifier required');

    const now = Date.now();
    const last = this.lastRequestByIdentifier.get(identifier) ?? 0;
    if (now - last < this.START_COOLDOWN_MS) {
      throw new BadRequestException('Too many requests, please wait a bit');
    }

    const otpId = randomUUID();
    const code = generateOtp(this.CODE_LENGTH);
    this.store.set(otpId, {
      code,
      identifier,
      expiresAt: now + this.TTL_MS,
      attempts: 0,
      lastSentAt: now,
    });

    this.lastRequestByIdentifier.set(identifier, now);

    // TODO: заменить на реальную доставку (SMS/email/Telegram)
    this.logger.log(`[OTP] ${identifier} -> ${code}`);

    return { otpId };
  }

  /**
   * (опционально) повторная отправка кода по текущему otpId.
   * Нужна, если на фронте есть кнопка "Отправить код еще раз".
   */
  async resend(otpId: string): Promise<void> {
    const rec = this.store.get(otpId);
    if (!rec) throw new UnauthorizedException('OTP expired or not found');

    const now = Date.now();
    if (now > rec.expiresAt) {
      this.store.delete(otpId);
      throw new UnauthorizedException('OTP expired');
    }
    if (now - rec.lastSentAt < this.RESEND_COOLDOWN_MS) {
      throw new BadRequestException('Please wait before resending OTP');
    }

    rec.lastSentAt = now;

    // TODO: реальная доставка
    this.logger.log(`[OTP:RESEND] ${rec.identifier} -> ${rec.code}`);
  }

  /**
   * Шаг 2: проверить код и вернуть идентификатор (телефон/почту/telegramId).
   */
  async verify(otpId: string, codeRaw: string): Promise<{ identifier: string }> {
    const rec = this.store.get(otpId);
    if (!rec) throw new UnauthorizedException('OTP expired or not found');

    const now = Date.now();
    if (now > rec.expiresAt) {
      this.store.delete(otpId);
      throw new UnauthorizedException('OTP expired');
    }

    rec.attempts += 1;
    if (rec.attempts > this.MAX_ATTEMPTS) {
      this.store.delete(otpId);
      throw new UnauthorizedException('Too many attempts');
    }

    const code = (codeRaw ?? '').trim();

    // DEV master-code (если задан) — принимает любой otpId
    if (!this.MASTER_CODE || code !== this.MASTER_CODE) {
      if (!this.safeEqual(rec.code, code)) {
        throw new UnauthorizedException('Invalid code');
      }
    }

    this.store.delete(otpId);
    return { identifier: rec.identifier };
  }

  // ----------------- helpers -----------------

  /** Нормализация: trim; если телефон — только + и цифры */
  private normalizeIdentifier(s: string): string {
    const x = (s ?? '').trim();
    if (!x) return '';
    // Простое эвристическое правило: если похоже на email — не трогаем
    const looksLikeEmail = /\S+@\S+\.\S+/.test(x);
    if (looksLikeEmail) return x;
    // иначе считаем телефоном и оставляем только + и цифры
    return x.replace(/[^\d+]/g, '');
  }

  /** Константное сравнение строк одинаковой длины */
  private safeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    // не идеально как crypto.timingSafeEqual(Buffer,...), но для строк достаточно
    let out = 0;
    for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return out === 0;
  }
}
