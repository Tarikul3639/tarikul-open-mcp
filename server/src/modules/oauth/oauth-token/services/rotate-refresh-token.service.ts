import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { hashRefreshToken } from '../utils/hash-refresh-token.util';

export interface RotateRefreshTokenInput {
  currentToken: string;
  nextToken: string;
  clientId: string;
}

@Injectable()
export class RotateRefreshTokenService {
  constructor(private readonly prisma: PrismaService) {}

  execute({ currentToken, nextToken, clientId }: RotateRefreshTokenInput): Promise<{
    userId: string;
    familyId: string;
  } | null> {
    const currentHash = hashRefreshToken(currentToken);
    const nextHash = hashRefreshToken(nextToken);

    return this.prisma.$transaction(async (tx) => {
      const token = await tx.mcpRefreshToken.findUnique({
        where: { tokenHash: currentHash },
      });
      if (!token || token.clientId !== clientId) return null;

      if (token.usedAt || !token.expiresAt || token.expiresAt <= new Date()) {
        await tx.mcpRefreshToken.deleteMany({ where: { familyId: token.familyId } });
        return null;
      }

      const updated = await tx.mcpRefreshToken.updateMany({
        where: { tokenHash: currentHash, usedAt: null },
        data: { usedAt: new Date() },
      });
      if (updated.count !== 1) {
        await tx.mcpRefreshToken.deleteMany({ where: { familyId: token.familyId } });
        return null;
      }

      await tx.mcpRefreshToken.create({
        data: {
          tokenHash: nextHash,
          clientId: token.clientId,
          userId: token.userId,
          familyId: token.familyId,
          expiresAt: token.expiresAt,
        },
      });
      return { userId: token.userId, familyId: token.familyId };
    });
  }
}
