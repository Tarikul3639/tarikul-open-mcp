import { Module } from '@nestjs/common';
import { WellKnownController } from './controllers/well-known.controller';
import { WellKnownService } from './services/well-known.service';

@Module({
  controllers: [WellKnownController],
  providers: [WellKnownService],
})
export class WellKnownModule {}