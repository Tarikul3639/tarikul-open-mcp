import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { OAuthGrantInput } from './ensure-oauth-grant.service';

@Injectable()
export class RestoreOAuthGrantService {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ userId, clientId }: OAuthGrantInput): Promise<boolean> {
    const result = await this.prisma.mcpOauthGrant.updateMany({
      where: { userId, clientId, revokedAt: { not: null } },
      data: { revokedAt: null },
    });
    return result.count === 1;
  }
}
