import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GoogleProfileService {
  constructor(private readonly prisma: PrismaService) { }

  execute(userId: string) {

    if (!userId) {
      throw new NotFoundException('User ID is required to fetch profile.');
    }
    return this.prisma.googleCalendarAccount.findUnique({
      where: { userId },
      select: { name: true, email: true, picture: true },
    });
  }
}
