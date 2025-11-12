import { Injectable } from '@nestjs/common';
import { IPlanfixGateway } from '../../planfix/client/planfix.gateway';

@Injectable()
export class WarrantyService {
  constructor(private readonly pf: IPlanfixGateway) {}

  async activateByQr(qr: string, buyerContactId?: string) {
    const found = await this.pf.findWarrantyByQr(qr);
    if (found.warranty) {
      if (buyerContactId && !found.warranty.buyerContactId) {
        await this.pf.linkBuyer({ warrantyId: found.warranty.id, contactId: buyerContactId });
      }
      return { status: 'found' as const, warranty: found.warranty };
    }
    const created = await this.pf.createWarranty({ qr });
    if (buyerContactId) await this.pf.linkBuyer({ warrantyId: created.id, contactId: buyerContactId });
    return { status: 'created' as const, warranty: created };
  }

  async delete(id: string) {
    const ok = await this.pf.deleteWarranty(id);
    return { ok };
  }
}
