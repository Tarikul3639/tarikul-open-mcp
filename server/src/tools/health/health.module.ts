import { Module } from '@nestjs/common';
import { HealthService } from './health.service.js';
import { HealthTool } from './health.tool.js';

@Module({
  controllers: [HealthTool],
  providers: [HealthService],
})
export class HealthModule {}
