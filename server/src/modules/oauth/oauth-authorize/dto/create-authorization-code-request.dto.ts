import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthorizationCodeRequestDto {
  @ApiProperty({ description: 'One-time authorization code' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ description: 'OAuth client identifier' })
  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @ApiProperty({ description: 'Registered redirect URI' })
  @IsString()
  @IsNotEmpty()
  redirectUri!: string;

  @ApiProperty({ description: 'PKCE S256 challenge' })
  @IsString()
  @IsNotEmpty()
  codeChallenge!: string;
}
