import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@generated/prisma/client';

/** Owns the application's Prisma client lifecycle. */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: config.getOrThrow<string>('DATABASE_URL'),
    });

    super({ adapter });
  }

  /** Connects Prisma when the Nest application starts. */
  async onModuleInit() {
    await this.$connect();
  }

  /** Disconnects Prisma when the Nest application shuts down. */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
