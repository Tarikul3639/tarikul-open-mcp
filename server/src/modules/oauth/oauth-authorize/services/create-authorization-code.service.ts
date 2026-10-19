import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { McpAuthorizationCode } from '@/../../generated/prisma/client';
import type { CreateAuthorizationCodeDto } from '../dto/create-authorization-code.dto';

@Injectable()
export class CreateAuthorizationCodeService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(data: CreateAuthorizationCodeDto): Promise<McpAuthorizationCode> {
    await this.prisma.mcpAuthorizationCode.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    return this.prisma.mcpAuthorizationCode.create({
      data: {
        code: data.code,
        clientId: data.clientId,
        userId: data.userId,
        redirectUri: data.redirectUri,
        codeChallenge: data.codeChallenge,
        codeChallengeMethod: 'S256',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
  }
}
