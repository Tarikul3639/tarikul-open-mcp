import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthorizationCodeDto {
  @ApiProperty({ description: 'One-time authorization code', example: 'c0de' })
  code!: string;

  userId!: string;

  @ApiProperty({ description: 'Registered OAuth client identifier' })
  clientId!: string;

  @ApiProperty({
    description: 'Exact redirect URI from the client registration',
  })
  redirectUri!: string;

  @ApiProperty({ description: 'PKCE S256 challenge' })
  codeChallenge!: string;
}
