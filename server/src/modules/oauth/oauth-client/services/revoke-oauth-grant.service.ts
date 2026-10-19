import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { OAuthRevokeResponseDto } from '../../oauth-token/dto/oauth-operation-response.dto';

@Injectable()
export class RevokeOAuthGrantService {
  constructor(private readonly prisma: PrismaService) {}

  execute(userId: string, clientId: string): Promise<OAuthRevokeResponseDto> {
    return this.prisma.$transaction(async (transaction) => {
      const result = await transaction.mcpOauthGrant.updateMany({
        where: { userId, clientId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      if (result.count === 0) return { revoked: false };

      await transaction.mcpRefreshToken.deleteMany({ where: { userId, clientId } });
      await transaction.mcpAuthorizationCode.deleteMany({ where: { userId, clientId } });
      return { revoked: true };
    });
  }
}
