import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { OAuthClientResponseDto } from '../dto/oauth-client-response.dto';

@Injectable()
export class GetOAuthClientRecordService {
  constructor(private readonly prisma: PrismaService) {}

  execute(clientId: string): Promise<OAuthClientResponseDto | null> {
    return this.prisma.mcpOauthClient.findUnique({
      where: { clientId },
      select: { clientId: true, clientName: true, redirectUris: true },
    });
  }
}
