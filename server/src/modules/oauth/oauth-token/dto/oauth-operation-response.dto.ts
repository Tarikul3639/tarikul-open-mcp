import { ApiProperty } from '@nestjs/swagger';

export class OAuthRevokeResponseDto {
  @ApiProperty({ description: 'Whether an active grant was revoked' })
  revoked!: boolean;
}
