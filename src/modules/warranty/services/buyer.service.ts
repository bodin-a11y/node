import { Injectable, BadRequestException } from '@nestjs/common';
import { IPlanfixGateway } from '../../planfix/client/planfix.gateway';
import { BuyerRegistrationDto } from '../dtos/buyer-registration.dto';

@Injectable()
export class BuyerService {
  constructor(private readonly pf: IPlanfixGateway) {}

  /** Найти/создать контакт покупателя и (опц.) привязать к талону */
  async ensureBuyer(dto: BuyerRegistrationDto & { warrantyId?: string }) {
    const contact =
      dto.contactId
        ? (await this.pf.updateContact({ id: dto.contactId, name: dto.name, phone: dto.phone, email: dto.email }))
        : await this.pf.upsertContact({ phone: dto.phone, email: dto.email, name: dto.name });

    if (dto.warrantyId) {
      await this.pf.linkBuyer({ warrantyId: dto.warrantyId, contactId: contact.id });
    }
    return { contact };
  }
}
