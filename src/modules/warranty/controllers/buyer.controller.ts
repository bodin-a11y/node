import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { BuyerService } from '../services/buyer.service';
import { BuyerRegistrationDto } from '../dtos/buyer-registration.dto';
// Если у тебя уже есть activate-warranty.dto.ts — можешь импортнуть его вместо inline-типа
// import { ActivateWarrantyDto } from '../dtos/activate-warranty.dto';

@Controller('warranty/buyer')
export class BuyerController {
  constructor(private readonly svc: BuyerService) {}

  /**
   * Создать/обновить покупателя и (опционально) привязать его к талону.
   *
   * Используется, если нам просто нужно убедиться,
   * что покупатель существует в системе (например, перед активацией).
   *
   * POST /warranty/buyer/ensure
   */
  @Post('ensure')
  @HttpCode(HttpStatus.OK)
  ensure(
    @Body()
    dto: BuyerRegistrationDto & {
      /** ID гарантийного талона (опционально) */
      warrantyId?: string;
    },
  ) {
    return this.svc.ensureBuyer(dto);
  }

  /**
   * Проверка талона перед активацией.
   *
   * По warrantyId возвращает информацию:
   * - существует ли талон;
   * - не истёк ли срок;
   * - не активирован ли уже (и кем/когда).
   *
   * Используется фронтом, чтобы показать:
   * - "талон уже активирован" / "можно активировать" и т.п.
   *
   * POST /warranty/buyer/check
   */
  @Post('check')
  @HttpCode(HttpStatus.OK)
  checkWarranty(
    @Body()
    body: {
      /** ID гарантийного талона из QR-кода */
      warrantyId: string;
    },
  ) {
    return this.svc.checkWarrantyForBuyer(body.warrantyId);
  }

  /**
   * Активация гарантийного талона покупателем.
   *
   * Покупатель сканирует QR, заполняет свои данные,
   * мы:
   * - создаём/обновляем покупателя,
   * - привязываем его к талону,
   * - меняем статус талона (например, на 'activated_by_buyer'),
   * - дергаем Planfix (пока через заглушку в сервисе).
   *
   * POST /warranty/buyer/activate
   */
  @Post('activate')
  @HttpCode(HttpStatus.OK)
  activate(
    @Body()
    dto: BuyerRegistrationDto & {
      /** ID гарантийного талона из QR-кода */
      warrantyId: string;
    },
  ) {
    return this.svc.activateWarrantyForBuyer(dto);
  }
}
