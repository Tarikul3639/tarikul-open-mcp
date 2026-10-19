import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class OAuthTokenRequestDto {
  @ApiProperty() @IsString() @IsNotEmpty() grant_type!: string;
  @ApiProperty() @IsString() @IsNotEmpty() client_id!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() resource?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() code?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() redirect_uri?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() code_verifier?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() refresh_token?: string;
}

export class OAuthErrorResponseDto {
  @ApiProperty() error!: string;
}
