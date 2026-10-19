import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OAuthAuthorizationCodeResponseDto {
  @ApiProperty({ description: 'One-time authorization code' })
  code!: string;

  @ApiProperty({ description: 'OAuth client identifier' })
  clientId!: string;

  @ApiProperty({ description: 'Authenticated user identifier' })
  userId!: string;

  @ApiProperty({ description: 'Registered redirect URI' })
  redirectUri!: string;

  @ApiProperty({ description: 'PKCE challenge' })
  codeChallenge!: string;

  @ApiProperty({ example: 'S256' })
  codeChallengeMethod!: string;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  expiresAt!: Date | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;
}

export class ConsumedAuthorizationCodeResponseDto {
  @ApiProperty({ description: 'Authenticated user identifier' })
  userId!: string;

  @ApiProperty({ description: 'OAuth client identifier' })
  clientId!: string;

  @ApiProperty({ description: 'Registered redirect URI' })
  redirectUri!: string;

  @ApiProperty({ description: 'PKCE challenge' })
  codeChallenge!: string;
}
