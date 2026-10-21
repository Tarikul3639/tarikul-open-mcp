import type { NextFunction, Request, Response } from 'express';

import type { BearerTokenStrategy } from '../strategies/bearer-token.strategy.js';

/**
 * HTTP-level authentication in front of the MCP Streamable HTTP endpoint.
 *
 * The MCP authorization spec requires the resource server to answer
 * unauthenticated requests with HTTP 401 and a `WWW-Authenticate` header
 * that points to the Protected Resource Metadata. MCP clients (Claude,
 * Cursor, VS Code, MCP Inspector ...) use that header to discover the
 * authorization server and start the browser login/consent flow.
 *
 * The NestJS McpAuthGuard still runs on every tool call as a second check.
 */
export function createMcpBearerAuthMiddleware(options: {
  strategy: BearerTokenStrategy;
  resourceMetadataUrl: string;
}) {
  const { strategy, resourceMetadataUrl } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Let CORS preflight requests through.
    if (req.method === 'OPTIONS') {
      return next();
    }

    try {
      const result = await strategy.verify(req.headers.authorization);

      if (!result.ok) {
        const challenge =
          result.reason === 'missing_token'
            ? `Bearer resource_metadata="${resourceMetadataUrl}"`
            : `Bearer error="invalid_token", error_description="The access token is invalid, expired, or revoked", resource_metadata="${resourceMetadataUrl}"`;

        res.setHeader('WWW-Authenticate', challenge);
        res.status(401).json({
          error:
            result.reason === 'missing_token'
              ? 'unauthorized'
              : 'invalid_token',
          error_description:
            result.reason === 'missing_token'
              ? 'Authorization required. Sign in to connect this MCP client.'
              : 'The access token is invalid, expired, or revoked.',
        });
        return;
      }

      // Same shape the MCP SDK and McpAuthGuard use.
      (req as Request & { auth?: unknown }).auth = {
        token: result.identity.token,
        clientId: result.identity.clientId,
        scopes: [],
        extra: { userId: result.identity.userId },
      };

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
