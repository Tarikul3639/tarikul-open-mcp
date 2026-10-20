
import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { GoogleProfileDto } from '../dto/google-profile.dto';
import { CurrentUserResponseDto } from '../dto/current-user-response.dto';

@Injectable()
export class AuthUserService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    /**
     * Creates a Google user or updates the existing user's profile.
     */
    async findOrCreateGoogleUser(
        profile: GoogleProfileDto,
    ): Promise<GoogleProfileDto & { id: string }> {
        const user = await this.prisma.user.upsert({
            where: {
                googleId: profile.sub,
            },
            update: {
                email: profile.email,
                name: profile.name,
                picture: profile.picture,
            },
            create: {
                googleId: profile.sub,
                email: profile.email,
                name: profile.name,
                picture: profile.picture,
            },
            select: {
                id: true,
                googleId: true,
                email: true,
                name: true,
                picture: true,
            },
        });

        return {
            id: user.id,
            sub: user.googleId,
            email: user.email,
            name: user.name ?? undefined,
            picture: user.picture ?? undefined,
        };
    }

    /**
     * Retrieves a user's public profile using the internal database ID.
     */
    async getCurrentUser(userId: string): Promise<CurrentUserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                email: true,
                name: true,
                picture: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }


    /**
     * Permanently deletes a user account and its related records.
     */
    async deleteUser(userId: string): Promise<void> {
        await this.prisma.user.delete({
            where: { id: userId },
        });
    }
}
