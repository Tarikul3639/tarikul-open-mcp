import { BadRequestException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { RequireOAuthSessionService } from '../../oauth-client/services/require-oauth-session.service';
import { GetOAuthClientRecordService } from '../../oauth-client/services/get-oauth-client-record.service';
import { includesRedirectUri } from '../../oauth-client/utils/redirect-uri.util';
import type { CreateAuthorizationCodeRequestDto } from '../dto/create-authorization-code-request.dto';
import { CreateAuthorizationCodeService } from './create-authorization-code.service';

@Injectable()
export class CreateDashboardAuthorizationCodeService {
  constructor(
    private readonly requireSession: RequireOAuthSessionService,
    private readonly getClient: GetOAuthClientRecordService,
    private readonly createCode: CreateAuthorizationCodeService,
  ) {}

  async execute(request: Request, input: CreateAuthorizationCodeRequestDto) {
    const userId = await this.requireSession.execute(request);
    const client = await this.getClient.execute(input.clientId);
    if (!client || !includesRedirectUri(client.redirectUris, input.redirectUri)) {
      throw new BadRequestException('Client or redirect URI is not registered.');
    }
    return this.createCode.execute({
      code: input.code,
      clientId: input.clientId,
      redirectUri: input.redirectUri,
      codeChallenge: input.codeChallenge,
      userId,
    });
  }
}
