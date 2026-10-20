import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type { GoogleTokens } from '../interfaces/google-tokens.interface';

@Injectable()
export class GoogleTokensService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string): Promise<GoogleTokens | null> {
    const account = await this.prisma.googleCalendarAccount.findUnique({
      where: { userId },
      select: { tokens: true },
    });

    if (
      !account?.tokens ||
      typeof account.tokens !== 'object' ||
      Array.isArray(account.tokens)
    ) {
      return null;
    }

    return account.tokens as GoogleTokens;
  }
}
