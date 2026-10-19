import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { OAuthRegistrationRequestDto } from '../dto/oauth-registration-request.dto';
import { isSafeRedirectUri } from '../utils/redirect-uri.util';
import { SaveOAuthClientRecordService } from './save-oauth-client-record.service';

@Injectable()
export class RegisterOAuthClientService {
  constructor(private readonly saveRecord: SaveOAuthClientRecordService) {}

  async execute(input: OAuthRegistrationRequestDto) {
    const validUris =
      Array.isArray(input?.redirect_uris) &&
      input.redirect_uris.length > 0 &&
      input.redirect_uris.length <= 20 &&
      input.redirect_uris.every(isSafeRedirectUri);
    if (!validUris) return { status: 400, body: { error: 'invalid_redirect_uri' } };

    const clientId = randomUUID();
    const clientName =
      typeof input.client_name === 'string'
        ? input.client_name.trim().slice(0, 120) || null
        : null;
    await this.saveRecord.execute({
      clientId,
      clientName: clientName ?? undefined,
      redirectUris: input.redirect_uris,
    });
    return {
      status: 201,
      body: {
        client_id: clientId,
        redirect_uris: input.redirect_uris,
        token_endpoint_auth_method: 'none',
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
      },
    };
  }
}
