import { Injectable } from '@nestjs/common';
import { IPlanfixGateway } from '../../planfix/client/planfix.gateway';
import { InstallerRegistrationDto } from '../dtos/installer-registration.dto';

@Injectable()
export class InstallerService {
  constructor(private readonly pf: IPlanfixGateway) {}
  async ensureInstaller(dto: InstallerRegistrationDto & { warrantyId?: string }) {
    const contact =
      dto.contactId
        ? (await this.pf.updateContact({ id: dto.contactId, name: dto.name, phone: dto.phone, email: dto.email }))
        : await this.pf.upsertContact({ phone: dto.phone, email: dto.email, name: dto.name });
    if (dto.warrantyId) await this.pf.linkInstaller({ warrantyId: dto.warrantyId, contactId: contact.id });
    return { contact };
  }
}
