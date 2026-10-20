import { Injectable } from '@nestjs/common';
import { GoogleProfileService } from '../../google/services/google-profile.service';
import { SessionUserService } from './session-user.service';

@Injectable()
export class GetSessionProfileService {
  constructor(
    private readonly sessionUserService: SessionUserService,
    private readonly googleProfileService: GoogleProfileService,
  ) {}

  async execute(token?: string) {
    const userId = await this.sessionUserService.execute(token);
    if (!userId) return null;
    return this.googleProfileService.execute(userId);
  }
}
