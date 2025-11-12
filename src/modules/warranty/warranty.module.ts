import { Module } from '@nestjs/common';
import { PlanfixModule } from '../planfix/services/planfix.module';
import { WarrantyController } from './controllers/warranty.controller';
import { BuyerController } from './controllers/buyer.controller';
import { SellerController } from './controllers/seller.controller';
import { InstallerController } from './controllers/installer.controller';
import { WarrantyService } from './services/warranty.service';
import { WarrantyStatusService } from './services/warranty-status.service';
import { BuyerService } from './services/buyer.service';
import { SellerService } from './services/seller.service';
import { InstallerService } from './services/installer.service';

@Module({
  imports: [PlanfixModule],
  controllers: [WarrantyController, BuyerController, SellerController, InstallerController],
  providers: [WarrantyService, WarrantyStatusService, BuyerService, SellerService, InstallerService],
  exports: [WarrantyService],
})
export class WarrantyModule {}
