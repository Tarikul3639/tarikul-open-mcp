import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import type { McpExecutionContext } from '@nestjs-mcp/server';

import { BearerTokenStrategy } from '../strategies/bearer-token.strategy';

@Injectable()
export class McpAuthGuard implements CanActivate {
  constructor(private readonly bearerTokenStrategy: BearerTokenStrategy) { }

  readonly logger = new Logger(McpAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const mcpContext = context as unknown as McpExecutionContext;
    const request = mcpContext.getRequest();

    // DEBUG: Log the request method and URL for debugging purposes.
    this.logger.log(`Validating MCP request for ${request.method} ${request.url}`);

    const identity = await this.bearerTokenStrategy.authenticate(
      request.headers?.authorization,
    );

    if (!identity.userId) {
      throw new UnauthorizedException('Authenticated user was not found');
    }

    // Attach verified identity to the current request.
    request.auth = {
      token: identity.token,
      clientId: identity.clientId,
      scopes: [],
      extra: { userId: identity.userId },
    };

    return true;
  }
}
