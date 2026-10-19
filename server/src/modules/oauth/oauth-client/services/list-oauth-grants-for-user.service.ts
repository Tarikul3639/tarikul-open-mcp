import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { OAuthGrantResponseDto } from '../dto/oauth-client-response.dto';

@Injectable()
export class ListOAuthGrantsForUserService {
  constructor(private readonly prisma: PrismaService) {}

  execute(userId: string): Promise<OAuthGrantResponseDto[]> {
    return this.prisma.mcpOauthGrant.findMany({
      where: { userId },
      include: {
        client: {
          select: { clientId: true, clientName: true, redirectUris: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
