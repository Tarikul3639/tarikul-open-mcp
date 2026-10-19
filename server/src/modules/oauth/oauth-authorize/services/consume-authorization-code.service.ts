import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { ConsumeAuthorizationCodeDto } from '../dto/consume-authorization-code.dto';
import type { ConsumedAuthorizationCodeResponseDto } from '../dto/oauth-authorization-code-response.dto';

@Injectable()
export class ConsumeAuthorizationCodeService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    data: ConsumeAuthorizationCodeDto,
  ): Promise<ConsumedAuthorizationCodeResponseDto | null> {
    const token = await this.prisma.mcpAuthorizationCode.findFirst({
      where: {
        code: data.code,
        userId: data.userId,
        clientId: data.clientId,
        redirectUri: data.redirectUri,
        codeChallenge: data.codeChallenge,
        codeChallengeMethod: 'S256',
        expiresAt: { gt: new Date() },
      },
      select: {
        code: true,
        userId: true,
        clientId: true,
        redirectUri: true,
        codeChallenge: true,
      },
    });
    if (!token) return null;

    const result = await this.prisma.mcpAuthorizationCode.deleteMany({
      where: {
        code: token.code,
        userId: data.userId,
        clientId: data.clientId,
        redirectUri: data.redirectUri,
        codeChallenge: data.codeChallenge,
        codeChallengeMethod: 'S256',
        expiresAt: { gt: new Date() },
      },
    });
    if (result.count !== 1) return null;

    return {
      userId: token.userId,
      clientId: token.clientId,
      redirectUri: token.redirectUri,
      codeChallenge: token.codeChallenge,
    };
  }
}
