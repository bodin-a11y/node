import { Injectable, LoggerService as NestLogger } from '@nestjs/common';
import pino from 'pino';

@Injectable()
export class LoggerService implements NestLogger {
  private readonly logger = pino({
    transport:
      process.env.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
  });

  log(message: string, context?: string) {
    this.logger.info({ context, message });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error({ context, message, trace });
  }

  warn(message: string, context?: string) {
    this.logger.warn({ context, message });
  }
}
