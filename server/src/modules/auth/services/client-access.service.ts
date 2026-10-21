import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { ClientAccessResponseDto } from '../dto/client-access.dto.js';

@Injectable()
export class ClientAccessService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns all OAuth client grants belonging to the specified user.
   */
  async findAll(userId: string): Promise<ClientAccessResponseDto[]> {
    const accesses = await this.prisma.mcpClientAccess.findMany({
      where: { userId },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });

    return accesses.map((access) => ({
      client_id: access.clientId,
      client_name: access.client.clientName,
      granted_at: access.createdAt,
      revoked_at: access.revokedAt,
    }));
  }

  /**
   * Restores a previously revoked client grant.
   * The grant must already exist for this user and client.
   */
  async restore(userId: string, clientId: string) {
    const access = await this.prisma.mcpClientAccess.findUnique({
      where: {
        userId_clientId: { userId, clientId },
      },
    });

    if (!access) {
      throw new NotFoundException('Client access not found');
    }

    return this.prisma.mcpClientAccess.update({
      where: {
        userId_clientId: { userId, clientId },
      },
      data: { revokedAt: null },
    });
  }

  /**
   * Revokes a client's grant for this user.
   */
  async revoke(userId: string, clientId: string) {
    const access = await this.prisma.mcpClientAccess.findUnique({
      where: {
        userId_clientId: { userId, clientId },
      },
    });

    if (!access) {
      throw new NotFoundException('Client access not found');
    }

    return this.prisma.mcpClientAccess.update({
      where: {
        userId_clientId: { userId, clientId },
      },
      data: { revokedAt: new Date() },
    });
  }
}
