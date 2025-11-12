import { Injectable } from '@nestjs/common';
import { IPlanfixGateway } from '../../planfix/client/planfix.gateway';

@Injectable()
export class WarrantyStatusService {
  constructor(private readonly pf: IPlanfixGateway) {}
  updateStatus(id: string, status: 'active' | 'expired') {
    return this.pf.updateWarrantyStatus(id, status).then(warranty => ({ warranty }));
  }
}
