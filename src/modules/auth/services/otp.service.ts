import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { generateOtp } from '../utils/otp';

/**
 * Простая in-memory реализация OTP.
 * Позже легко заменить Map → Redis, не меняя внешний интерфейс.
 */
type OtpRecord = { code: string; identifier: string; expiresAt: number; attempts: number };

@Injectable()
export class OtpService {
  private store = new Map<string, OtpRecord>();

  private TTL_MS = Number(process.env.OTP_TTL_MS ?? 5 * 60_000);
  private MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS ?? 5);

  /**
   * Шаг 1: сгенерировать код и "отправить".
   * Сейчас отправка — в консоль; подключи SMS/Email/Telegram, когда будешь готов.
   */
  async start(identifier: string): Promise<{ otpId: string }> {
    if (!identifier) throw new BadRequestException('identifier required');

    const otpId = randomUUID();
    const code = generateOtp(6);
    this.store.set(otpId, { code, identifier, expiresAt: Date.now() + this.TTL_MS, attempts: 0 });

    // TODO: заменить на реальную доставку (SMS/email/Telegram)
    // Например:
    // await this.notifier.sendSms(identifier, `Ваш код входа: ${code}`);
    // или await this.telegram.sendMessage(telegramId, `Код: ${code}`);
    // MVP:
    // eslint-disable-next-line no-console
    console.log(`[OTP] ${identifier} -> ${code}`);

    return { otpId };
  }

  /**
   * Шаг 2: проверить код и вернуть идентификатор (телефон/почту/telegramId).
   */
  async verify(otpId: string, code: string): Promise<{ identifier: string }> {
    const rec = this.store.get(otpId);
    if (!rec) throw new UnauthorizedException('OTP expired or not found');

    if (Date.now() > rec.expiresAt) {
      this.store.delete(otpId);
      throw new UnauthorizedException('OTP expired');
    }

    rec.attempts += 1;
    if (rec.attempts > this.MAX_ATTEMPTS) {
      this.store.delete(otpId);
      throw new UnauthorizedException('Too many attempts');
    }

    if (rec.code !== code) {
      throw new UnauthorizedException('Invalid code');
    }

    this.store.delete(otpId);
    return { identifier: rec.identifier };
  }
}
