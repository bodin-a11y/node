import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { WarrantyService } from '../services/warranty.service';
import { WarrantyStatusService } from '../services/warranty-status.service';
import { ActivateWarrantyDto } from '../dtos/activate-warranty.dto';
import { UpdateWarrantyDto } from '../dtos/update-warranty.dto';

@Controller('warranty')
export class WarrantyController {
  constructor(
    private readonly svc: WarrantyService,
    private readonly status: WarrantyStatusService,
  ) {}

  @Post('activate')
  activate(@Body() dto: ActivateWarrantyDto) {
    return this.svc.activateByQr(dto.qr, dto.buyerContactId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateWarrantyDto) {
    return this.status.updateStatus(id, dto.status);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.svc.delete(id);
  }
}
