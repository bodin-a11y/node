import { Body, Controller, Post } from '@nestjs/common';
import { SellerService } from '../services/seller.service';
import { SellerRegistrationDto } from '../dtos/seller-registration.dto';

@Controller('warranty/seller')
export class SellerController {
  constructor(private readonly svc: SellerService) {}
  @Post('ensure')
  ensure(@Body() dto: SellerRegistrationDto & { warrantyId?: string }) {
    return this.svc.ensureSeller(dto);
  }
}
