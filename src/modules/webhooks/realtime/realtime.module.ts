import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';

/**
 * RealtimeModule
 *
 * Этот модуль:
 * - Регистрирует WebSocket-gateway.
 * - Экспортирует его, чтобы другие сервисы могли вызывать:
 *     this.realtimeGateway.notifyWarrantyStatusChanged(...)
 */
@Module({
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
