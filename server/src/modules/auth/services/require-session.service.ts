import { Injectable } from '@nestjs/common';
import { SessionService } from '../../../common/session/session.service';

@Injectable()
export class RequireSessionService {
  constructor(private readonly sessionService: SessionService) {}

  execute(token?: string): Promise<string> {
    return this.sessionService.requireUser(token);
  }
}
