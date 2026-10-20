import { Module } from '@nestjs/common';
import { HealthService } from './health.service.js';
import { HealthTool } from './health.tool.js';

@Module({
    providers: [HealthService, HealthTool],
})
export class HealthModule { }