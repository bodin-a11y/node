import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { SellerService } from '../services/seller.service';

@Controller('warranty/seller')
export class SellerController {
  constructor(private readonly svc: SellerService) {}

  /**
   * Привязать продавца к гарантийному талону.
   *
   * Продавец уже существует в системе (auth/Planfix),
   * сюда приходят:
   * - warrantyId (из QR или из системы)
   * - sellerContactId (id контакта продавца в Planfix)
   *
   * POST /warranty/seller/attach
   */
  @Post('attach')
  @HttpCode(HttpStatus.OK)
  attach(
    @Body()
    body: {
      warrantyId: string;
      sellerContactId: string;
    },
  ) {
    return this.svc.attachSellerToWarranty(
      body.warrantyId,
      body.sellerContactId,
    );
  }

  /**
   * Оформить возврат.
   *
   * Возвращает талон к статусу 'draft', если он ещё в периоде ожидания.
   * Если талон уже 'active' — возврат запрещён.
   *
   * POST /warranty/seller/return
   */
  @Post('return')
  @HttpCode(HttpStatus.OK)
  returnWarranty(
    @Body()
    body: {
      warrantyId: string;
    },
  ) {
    return this.svc.returnWarranty(body.warrantyId);
  }
}
