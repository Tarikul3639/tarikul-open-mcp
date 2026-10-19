import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { McpRefreshToken } from '@/../../generated/prisma/client';
import { hashRefreshToken } from '../utils/hash-refresh-token.util';

@Injectable()
export class SaveRefreshTokenService {
  constructor(private readonly prisma: PrismaService) {}

  execute(input: {
    token: string;
    clientId: string;
    userId: string;
    familyId: string;
  }): Promise<McpRefreshToken> {
    const tokenHash = hashRefreshToken(input.token);
    return this.prisma.mcpRefreshToken.create({
      data: {
        tokenHash,
        clientId: input.clientId,
        userId: input.userId,
        familyId: input.familyId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }
}
