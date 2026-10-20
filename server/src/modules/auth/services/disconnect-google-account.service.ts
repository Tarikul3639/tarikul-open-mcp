import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GoogleTokenRevokeService } from '../../google/services/google-token-revoke.service';

@Injectable()
export class DisconnectGoogleAccountService {
  private readonly logger = new Logger(DisconnectGoogleAccountService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly googleTokenRevokeService: GoogleTokenRevokeService,
  ) { }

  async execute(userId: string | null): Promise<{ count: number }> {

    if (!userId) {
      throw new NotFoundException(
        'User ID is required to disconnect Google account.',
      );
    }

    try {
      await this.googleTokenRevokeService.execute(userId);

      return await this.prisma.$transaction(async (transaction) => {
        await transaction.mcpOauthGrant.updateMany({
          where: { userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });

        await transaction.mcpRefreshToken.deleteMany({
          where: { userId },
        });

        await transaction.mcpAuthorizationCode.deleteMany({
          where: { userId },
        });

        return transaction.googleCalendarAccount.deleteMany({
          where: { userId },
        });
      });
    } catch (error) {
      this.logger.error(
        `Failed to disconnect Google account for user ${userId}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'Failed to disconnect Google account.',
      );
    }
  }
}
