import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Logger } from '@nestjs/common';
  import { Server, Socket } from 'socket.io';
  
  /**
   * Gateway для realtime-событий.
   *
   * Что умеет:
   * - Клиенты подключаются по WebSocket.
   * - Клиент может "подписаться" на конкретный гарантийный талон (joinWarranty).
   * - Бэкенд может пушить события по изменению статуса талона:
   *      notifyWarrantyStatusChanged(warrantyId, newStatus)
   * - Все клиенты, подписанные на этот талон, сразу получают событие 'warrantyStatusChanged'.
   */
  @WebSocketGateway({
    cors: {
      origin: '*', // TODO: потом ограничишь доменами фронтенда
    },
  })
  export class RealtimeGateway {
    @WebSocketServer()
    server: Server;
  
    private readonly logger = new Logger(RealtimeGateway.name);
  
    /**
     * Вызывается, когда клиент подключается по WebSocket.
     */
    handleConnection(client: Socket) {
      this.logger.log(`Client connected: ${client.id}`);
    }
  
    /**
     * Вызывается, когда клиент отключается.
     */
    handleDisconnect(client: Socket) {
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  
    /**
     * Клиент подписывается на обновления по конкретному гарантийному талону.
     *
     * На фронтенде будет что-то вроде:
     *   socket.emit('joinWarranty', { warrantyId: '123' });
     */
    @SubscribeMessage('joinWarranty')
    handleJoinWarranty(
      @MessageBody() data: { warrantyId: string },
      @ConnectedSocket() client: Socket,
    ) {
      const { warrantyId } = data || {};
  
      if (!warrantyId) {
        this.logger.warn(
          `Client ${client.id} tried to join warranty room without warrantyId`,
        );
        client.emit('error', { message: 'warrantyId is required' });
        return;
      }
  
      const roomName = this.getWarrantyRoomName(warrantyId);
  
      client.join(roomName);
      this.logger.log(`Client ${client.id} joined room ${roomName}`);
  
      client.emit('joinedWarranty', { warrantyId });
    }
  
    /**
     * Клиент может явно отписаться от талона.
     *
     * На фронте:
     *   socket.emit('leaveWarranty', { warrantyId: '123' });
     */
    @SubscribeMessage('leaveWarranty')
    handleLeaveWarranty(
      @MessageBody() data: { warrantyId: string },
      @ConnectedSocket() client: Socket,
    ) {
      const { warrantyId } = data || {};
  
      if (!warrantyId) {
        return;
      }
  
      const roomName = this.getWarrantyRoomName(warrantyId);
      client.leave(roomName);
      this.logger.log(`Client ${client.id} left room ${roomName}`);
  
      client.emit('leftWarranty', { warrantyId });
    }
  
    /**
     * Публичный метод для других сервисов.
     *
     * Вызываешь, когда статус гарантии изменился (например, после вебхука от Planfix):
     *
     *   this.realtimeGateway.notifyWarrantyStatusChanged(warrantyId, newStatus);
     *
     * Все клиенты, подписанные на этот warrantyId, получат событие 'warrantyStatusChanged'.
     */
    notifyWarrantyStatusChanged(warrantyId: string, newStatus: string) {
      const roomName = this.getWarrantyRoomName(warrantyId);
  
      this.logger.log(
        `Emitting warrantyStatusChanged for warranty ${warrantyId} with status ${newStatus}`,
      );
  
      this.server.to(roomName).emit('warrantyStatusChanged', {
        warrantyId,
        status: newStatus,
      });
    }
  
    /**
     * На будущее: можно пушить любые другие обновления по талону.
     */
    notifyWarrantyUpdated(warrantyId: string, payload: Record<string, any>) {
      const roomName = this.getWarrantyRoomName(warrantyId);
  
      this.logger.log(
        `Emitting warrantyUpdated for warranty ${warrantyId} with payload`,
      );
  
      this.server.to(roomName).emit('warrantyUpdated', {
        warrantyId,
        ...payload,
      });
    }
  
    /**
     * Внутренний helper: формируем имя комнаты по warrantyId.
     */
    private getWarrantyRoomName(warrantyId: string): string {
      return `warranty_${warrantyId}`;
    }
  }
  