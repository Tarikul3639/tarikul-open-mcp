import { Injectable, NotFoundException } from '@nestjs/common';
import { GoogleProfileService } from '../../google/services/google-profile.service';

@Injectable()
export class GetProfileService {
  constructor(private readonly googleProfileService: GoogleProfileService) { }

  execute(userId: string) {
    if (!userId) {
      throw new NotFoundException('User ID is required to fetch profile.');
    }

    const profile = this.googleProfileService.execute(userId);

    if (!profile) {
      throw new NotFoundException('Profile not found for the given user ID.');
    }

    return profile;
  }
}
