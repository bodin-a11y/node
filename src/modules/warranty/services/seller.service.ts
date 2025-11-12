import { Injectable } from '@nestjs/common';
import { IPlanfixGateway } from '../../planfix/client/planfix.gateway';
import { SellerRegistrationDto } from '../dtos/seller-registration.dto';

@Injectable()
export class SellerService {
  constructor(private readonly pf: IPlanfixGateway) {}
  async ensureSeller(dto: SellerRegistrationDto & { warrantyId?: string }) {
    const contact =
      dto.contactId
        ? (await this.pf.updateContact({ id: dto.contactId, name: dto.name, phone: dto.phone, email: dto.email }))
        : await this.pf.upsertContact({ phone: dto.phone, email: dto.email, name: dto.name });
    if (dto.warrantyId) await this.pf.linkSeller({ warrantyId: dto.warrantyId, contactId: contact.id });
    return { contact };
  }
}
