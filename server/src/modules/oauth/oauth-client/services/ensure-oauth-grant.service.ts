import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

export interface OAuthGrantInput {
  userId: string;
  clientId: string;
}

@Injectable()
export class EnsureOAuthGrantService {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ userId, clientId }: OAuthGrantInput): Promise<boolean> {
    const grant = await this.prisma.mcpOauthGrant.upsert({
      where: { userId_clientId: { userId, clientId } },
      create: { userId, clientId, revokedAt: null },
      update: {},
    });
    return grant.revokedAt === null;
  }
}
