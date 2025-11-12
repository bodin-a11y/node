// src/modules/planfix/services/planfix.module.ts

import { Module, Provider } from '@nestjs/common';
import { IPlanfixGateway } from '../client/planfix.gateway';
import { PlanfixGatewayMock } from '../client/planfix.gateway.mock';
// Реальную реализацию подключим позже:
// import { PlanfixGatewayReal } from '../client/planfix.gateway.real';

const gatewayProvider: Provider = {
  provide: IPlanfixGateway,
  useClass:
    process.env.PLANFIX_MODE === 'real'
      ? /* PlanfixGatewayReal */ PlanfixGatewayMock // временно mock
      : PlanfixGatewayMock,
};

@Module({
  providers: [gatewayProvider],
  exports: [IPlanfixGateway],
})
export class PlanfixModule {}
