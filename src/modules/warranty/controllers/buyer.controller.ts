import { Body, Controller, Post } from '@nestjs/common';
import { BuyerService } from '../services/buyer.service';
import { BuyerRegistrationDto } from '../dtos/buyer-registration.dto';

@Controller('warranty/buyer')
export class BuyerController {
  constructor(private readonly svc: BuyerService) {}

  /** Создать/обновить покупателя и (опц.) привязать к талону */
  @Post('ensure')
  ensure(@Body() dto: BuyerRegistrationDto & { warrantyId?: string }) {
    return this.svc.ensureBuyer(dto);
  }
}
