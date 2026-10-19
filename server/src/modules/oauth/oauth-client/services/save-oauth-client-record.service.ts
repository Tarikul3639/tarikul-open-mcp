import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import type { McpOauthClient } from '@/../../generated/prisma/client';
import type { SaveOAuthClientDto } from '../dto/save-oauth-client.dto';

@Injectable()
export class SaveOAuthClientRecordService {
  constructor(private readonly prisma: PrismaService) {}

  execute(data: SaveOAuthClientDto): Promise<McpOauthClient> {
    return this.prisma.mcpOauthClient.upsert({
      where: { clientId: data.clientId },
      create: {
        clientId: data.clientId,
        redirectUris: data.redirectUris,
        clientName: data.clientName,
      },
      update: {
        redirectUris: data.redirectUris,
        clientName: data.clientName,
      },
    });
  }
}
