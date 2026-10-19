import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { OAuthRevokeResponseDto } from '../../oauth-token/dto/oauth-operation-response.dto';

@Injectable()
export class RevokeAllOAuthGrantsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string): Promise<OAuthRevokeResponseDto> {
    await this.prisma.$transaction(async (transaction) => {
      const revokedAt = new Date();
      await transaction.mcpOauthGrant.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt },
      });
      await transaction.mcpRefreshToken.deleteMany({ where: { userId } });
      await transaction.mcpAuthorizationCode.deleteMany({ where: { userId } });
    });
    return { revoked: true };
  }
}
