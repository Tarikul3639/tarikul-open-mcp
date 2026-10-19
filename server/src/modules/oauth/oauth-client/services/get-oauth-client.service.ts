import { Injectable, NotFoundException } from '@nestjs/common';
import type { Request } from 'express';
import { GetOAuthClientRecordService } from './get-oauth-client-record.service';
import { RequireOAuthSessionService } from './require-oauth-session.service';

@Injectable()
export class GetOAuthClientService {
  constructor(
    private readonly requireSession: RequireOAuthSessionService,
    private readonly getRecord: GetOAuthClientRecordService,
  ) {}

  async execute(request: Request, clientId: string) {
    await this.requireSession.execute(request);
    const client = await this.getRecord.execute(clientId);
    if (!client) throw new NotFoundException('OAuth client was not found.');
    return client;
  }
}
