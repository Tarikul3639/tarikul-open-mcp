import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

/** Reports service availability and database connectivity. */
@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  /** Checks database connectivity and returns the corresponding health state. */
  async check(): Promise<{ status: string; database: string }> {
    try {
      await this.prisma.$connect();

      return { status: 'online', database: 'connected' };
    } catch {
      return { status: 'degraded', database: 'unavailable' };
    }
  }
}
