import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OAuthClientResponseDto {
  @ApiProperty({ description: 'Public OAuth client identifier' })
  clientId!: string;

  @ApiPropertyOptional({
    description: 'Human-readable client name',
    nullable: true,
  })
  clientName!: string | null;

  @ApiProperty({ type: [String], description: 'Allowed redirect URIs' })
  redirectUris!: unknown;
}

export class OAuthGrantClientResponseDto {
  @ApiProperty({ description: 'Public OAuth client identifier' })
  clientId!: string;

  @ApiPropertyOptional({
    description: 'Human-readable client name',
    nullable: true,
  })
  clientName!: string | null;

  @ApiProperty({ type: [String], description: 'Allowed redirect URIs' })
  redirectUris!: unknown;
}

export class OAuthGrantResponseDto {
  @ApiProperty({ description: 'Owner user identifier' })
  userId!: string;

  @ApiProperty({ description: 'Public OAuth client identifier' })
  clientId!: string;

  @ApiProperty({ description: 'Grant creation time', format: 'date-time' })
  createdAt!: Date;

  @ApiPropertyOptional({
    description: 'Revocation time',
    format: 'date-time',
    nullable: true,
  })
  revokedAt!: Date | null;

  @ApiProperty({ type: OAuthGrantClientResponseDto })
  client!: OAuthGrantClientResponseDto;
}
