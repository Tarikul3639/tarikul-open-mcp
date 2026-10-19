import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { OAuthGrantInput } from './ensure-oauth-grant.service';

@Injectable()
export class CheckOAuthGrantService {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ userId, clientId }: OAuthGrantInput): Promise<boolean> {
    const grant = await this.prisma.mcpOauthGrant.findFirst({
      where: { userId, clientId, revokedAt: null },
      select: { userId: true },
    });
    return grant !== null;
  }
}
