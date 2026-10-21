import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import type { McpContext } from '@rekog/mcp-nest';

import { BearerTokenStrategy } from '../../auth/strategies/bearer-token.strategy.js';

@Injectable()
export class McpAuthGuard implements CanActivate {
  constructor(private readonly bearerTokenStrategy: BearerTokenStrategy) {}

  readonly logger = new Logger(McpAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const mcpContext = context.switchToRpc().getContext<McpContext>();
    const request = mcpContext?.getRawRequest<{
      method?: string;
      url?: string;
      headers?: { authorization?: string };
      auth?: {
        token: string;
        clientId: string;
        scopes: string[];
        extra: { userId: string };
      };
    }>();

    if (!request) {
      throw new RpcException('An HTTP MCP request is required');
    }

    this.logger.log(
      `Validating MCP request for ${request.method ?? 'MCP'} ${request.url ?? 'tool call'}`,
    );

    const identity = await this.bearerTokenStrategy.authenticate(
      request.headers?.authorization,
    );

    if (!identity.userId) {
      throw new RpcException('Authenticated user was not found');
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
