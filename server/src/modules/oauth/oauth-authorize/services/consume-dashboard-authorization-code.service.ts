import { BadRequestException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { RequireOAuthSessionService } from '../../oauth-client/services/require-oauth-session.service';
import type { ConsumeAuthorizationCodeRequestDto } from '../dto/consume-authorization-code.dto';
import { ConsumeAuthorizationCodeService } from './consume-authorization-code.service';

@Injectable()
export class ConsumeDashboardAuthorizationCodeService {
  constructor(
    private readonly requireSession: RequireOAuthSessionService,
    private readonly consumeCode: ConsumeAuthorizationCodeService,
  ) {}

  async execute(request: Request, input: ConsumeAuthorizationCodeRequestDto) {
    const userId = await this.requireSession.execute(request);
    const result = await this.consumeCode.execute({
      code: input.code,
      clientId: input.clientId,
      redirectUri: input.redirectUri,
      codeChallenge: input.codeChallenge,
      userId,
    });
    if (!result) {
      throw new BadRequestException('Authorization code is invalid or expired.');
    }
    return result;
  }
}
