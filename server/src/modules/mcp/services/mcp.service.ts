import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'node:stream';
import type { Request, Response } from 'express';
import { CreateCalendarEventService } from '../../calendar/services/create-calendar-event.service';
import { DeleteCalendarEventService } from '../../calendar/services/delete-calendar-event.service';
import { FindCalendarEventsByDateService } from '../../calendar/services/find-calendar-events-by-date.service';
import { GetCalendarEventService } from '../../calendar/services/get-calendar-event.service';
import { ListCalendarEventsService } from '../../calendar/services/list-calendar-events.service';
import { UpdateCalendarEventService } from '../../calendar/services/update-calendar-event.service';
import { McpAuthService } from './mcp-auth.service';

/** Handles MCP transport requests, authentication, and tool registration. */
@Injectable()
export class McpService {
  private readonly issuer: string;

  constructor(
    private readonly authService: McpAuthService,
    private readonly listCalendarEventsService: ListCalendarEventsService,
    private readonly createCalendarEventService: CreateCalendarEventService,
    private readonly findCalendarEventsByDateService: FindCalendarEventsByDateService,
    private readonly getCalendarEventService: GetCalendarEventService,
    private readonly updateCalendarEventService: UpdateCalendarEventService,
    private readonly deleteCalendarEventService: DeleteCalendarEventService,
    private readonly config: ConfigService,
  ) {
    this.issuer = this.config.getOrThrow<string>('MCP_BASE_URL');
  }

  /** Authenticates and dispatches one MCP streamable-HTTP request. */
  async handle(request: Request, response: Response, authorization?: string) {
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    const user = token ? await this.authService.authorizedUser(token) : null;

    if (!user) {
      response.setHeader(
        'WWW-Authenticate',
        `Bearer resource_metadata="${this.issuer}/.well-known/oauth-protected-resource"`,
      );
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const { createMcpHandler, withMcpAuth } = await import('mcp-handler');
    const { registerPingTool } = await import('../tools/ping.tools');
    const { registerCalendarTools } = await import('../tools/calendar.tools');

    const handler = createMcpHandler((server) => {
      registerPingTool(server);
      registerCalendarTools(
        server,
        {
          list: this.listCalendarEventsService,
          create: this.createCalendarEventService,
          findByDate: this.findCalendarEventsByDateService,
          get: this.getCalendarEventService,
          update: this.updateCalendarEventService,
          delete: this.deleteCalendarEventService,
        },
        this.authService,
      );
    });

    const wrapped = withMcpAuth(
      handler,
      async () => ({
        token: token!,
        clientId: user.clientId,
        scopes: ['calendar'],
        extra: { userId: user.userId },
      }),
      { required: true },
    );

    const incoming = new Request(`${this.issuer}/api/mcp`, {
      method: request.method,
      headers: request.headers as HeadersInit,
      body: JSON.stringify(request.body),
    });

    const upstream = await wrapped(incoming);

    response.status(upstream.status);
    upstream.headers.forEach((value, key) => response.setHeader(key, value));

    if (!upstream.body) return response.end();

    return Readable.fromWeb(
      upstream.body as import('node:stream/web').ReadableStream<Uint8Array>,
    ).pipe(response);
  }
}
