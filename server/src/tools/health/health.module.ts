import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthTool } from './health.tool';

@Module({
    providers: [HealthService, HealthTool],
})
export class HealthModule { }