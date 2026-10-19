import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { ConsumedAuthorizationCodeResponseDto } from '../dto/oauth-authorization-code-response.dto';

export interface ConsumeAuthorizationCodeForTokenInput {
  code: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
}

@Injectable()
export class ConsumeAuthorizationCodeForTokenService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    data: ConsumeAuthorizationCodeForTokenInput,
  ): Promise<ConsumedAuthorizationCodeResponseDto | null> {
    const token = await this.prisma.mcpAuthorizationCode.findFirst({
      where: {
        code: data.code,
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

    const deleted = await this.prisma.mcpAuthorizationCode.deleteMany({
      where: {
        code: token.code,
        clientId: data.clientId,
        redirectUri: data.redirectUri,
        codeChallenge: data.codeChallenge,
        codeChallengeMethod: 'S256',
        expiresAt: { gt: new Date() },
      },
    });
    if (deleted.count !== 1) return null;

    return {
      userId: token.userId,
      clientId: token.clientId,
      redirectUri: token.redirectUri,
      codeChallenge: token.codeChallenge,
    };
  }
}
