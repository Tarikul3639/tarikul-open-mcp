import { Injectable } from '@nestjs/common';
import { SessionService } from '../../../common/session/session.service';

@Injectable()
export class SessionUserService {
  constructor(private readonly sessionService: SessionService) {}

  execute(token?: string): Promise<string | null> {
    return this.sessionService.user(token);
  }
}
