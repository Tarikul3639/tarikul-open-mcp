import { Module } from '@nestjs/common';
import { WellKnownController } from './controllers/well-known.controller.js';
import { WellKnownService } from './services/well-known.service.js';

@Module({
  controllers: [WellKnownController],
  providers: [WellKnownService],
})
export class WellKnownModule {}
