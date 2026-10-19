import { ApiPropertyOptional } from '@nestjs/swagger';

export class GoogleTokensResponseDto {
  @ApiPropertyOptional({
    description: 'Google OAuth access token',
    nullable: true,
  })
  access_token?: string | null;

  @ApiPropertyOptional({
    description: 'Google OAuth refresh token',
    nullable: true,
  })
  refresh_token?: string | null;

  @ApiPropertyOptional({
    description: 'Access token expiry time as a Unix timestamp',
    nullable: true,
  })
  expiry_date?: number | null;

  @ApiPropertyOptional({
    description: 'Granted Google OAuth scopes',
    nullable: true,
  })
  scope?: string | null;
}
