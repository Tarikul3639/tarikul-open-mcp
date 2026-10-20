import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { SessionService } from '../services/session.service.js';

interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        expiresAt: Date;
    };
}

@Injectable()
export class SessionGuard implements CanActivate {
    constructor(private readonly sessionService: SessionService) { }

    readonly logger = new Logger(SessionGuard.name);

    /**
     * Validates the application session before allowing access
     * to protected routes.
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        this.logger.log(`Validating session for request to ${request.method} ${request.url}`);

        const token = request.cookies?.app_session as string | undefined;

        if (!token) {
            throw new UnauthorizedException('Authentication required');
        }

        // Reject invalid, expired, or revoked sessions.
        const session = await this.sessionService.validateSession(token);

        // Make the authenticated identity available to controllers.
        request.user = {
            userId: session.userId,
            expiresAt: session.expiresAt,
        };

        return true;
    }
}
