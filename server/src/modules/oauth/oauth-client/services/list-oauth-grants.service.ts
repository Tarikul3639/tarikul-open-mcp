import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { ListOAuthGrantsForUserService } from './list-oauth-grants-for-user.service';
import { RequireOAuthSessionService } from './require-oauth-session.service';

@Injectable()
export class ListOAuthGrantsService {
  constructor(
    private readonly requireSession: RequireOAuthSessionService,
    private readonly listForUser: ListOAuthGrantsForUserService,
  ) {}

  async execute(request: Request) {
    const userId = await this.requireSession.execute(request);
    const grants = await this.listForUser.execute(userId);
    return grants.map(({ client, ...grant }) => ({
      ...grant,
      client: {
        clientId: client.clientId,
        clientName: client.clientName,
        redirectUris: client.redirectUris as string[],
      },
    }));
  }
}
