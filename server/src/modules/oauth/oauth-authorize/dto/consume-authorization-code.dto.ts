import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConsumeAuthorizationCodeDto {
  @ApiProperty({ description: 'One-time authorization code' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  userId!: string;

  @ApiProperty({ description: 'Registered OAuth client identifier' })
  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @ApiProperty({ description: 'Exact redirect URI used in authorization' })
  @IsString()
  @IsNotEmpty()
  redirectUri!: string;

  @ApiProperty({ description: 'PKCE S256 challenge' })
  @IsString()
  @IsNotEmpty()
  codeChallenge!: string;
}

export class ConsumeAuthorizationCodeRequestDto {
  @ApiProperty({ description: 'One-time authorization code' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ description: 'Registered OAuth client identifier' })
  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @ApiProperty({ description: 'Exact redirect URI used in authorization' })
  @IsString()
  @IsNotEmpty()
  redirectUri!: string;

  @ApiProperty({ description: 'PKCE S256 challenge' })
  @IsString()
  @IsNotEmpty()
  codeChallenge!: string;
}
