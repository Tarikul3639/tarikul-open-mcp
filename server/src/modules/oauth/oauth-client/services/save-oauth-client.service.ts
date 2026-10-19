import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import type { SaveOAuthClientDto } from '../dto/save-oauth-client.dto';
import { isSafeRedirectUri } from '../utils/redirect-uri.util';
import { GetOAuthClientRecordService } from './get-oauth-client-record.service';
import { RequireOAuthSessionService } from './require-oauth-session.service';
import { SaveOAuthClientRecordService } from './save-oauth-client-record.service';

@Injectable()
export class SaveOAuthClientService {
  constructor(
    private readonly requireSession: RequireOAuthSessionService,
    private readonly getRecord: GetOAuthClientRecordService,
    private readonly saveRecord: SaveOAuthClientRecordService,
  ) {}

  async execute(request: Request, input: SaveOAuthClientDto) {
    await this.requireSession.execute(request);
    if (!input.redirectUris.every(isSafeRedirectUri)) {
      throw new BadRequestException(
        'Each redirect URI must use HTTPS or a loopback HTTP address.',
      );
    }
    if (await this.getRecord.execute(input.clientId)) {
      throw new ConflictException('OAuth client identifier is already registered.');
    }
    const client = await this.saveRecord.execute(input);
    return {
      clientId: client.clientId,
      clientName: client.clientName,
      redirectUris: client.redirectUris as string[],
    };
  }
}
