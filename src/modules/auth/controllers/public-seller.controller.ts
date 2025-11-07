// Публичные эндпоинты для формы "Я продавец":
//  - POST /public/seller/registration       — отправка формы, создание заявки в Planfix
//  - GET  /public/seller/registration/:id/status — проверка статуса заявки (pending/approved/rejected)

import { Controller, Post, Body, Get, Param, HttpCode } from '@nestjs/common';
import { PublicSellerService } from '../services/public-seller.service';
import { RegisterSellerDto } from '../dto/register-seller.dto';

@Controller('public/seller')
export class PublicSellerController {
  constructor(private readonly service: PublicSellerService) {}

  @Post('registration')
  @HttpCode(200) // возвращаем 200 даже при ALREADY_PENDING — это не ошибка
  async createRegistration(@Body() dto: RegisterSellerDto) {
    // Сервис сам валидирует дилера, дедуплицирует заявку и создаёт задачу в Planfix
    const result = await this.service.createRegistration(dto);
    return { success: true, data: result };
  }

  @Get('registration/:ticketId/status')
  async registrationStatus(@Param('ticketId') ticketId: string) {
    // Возвращает только статус заявки — фронту достаточно для отображения
    const status = await this.service.getRegistrationStatus(ticketId);
    return { success: true, data: { status } };
  }
}
