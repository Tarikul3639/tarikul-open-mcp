import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class OAuthAuthorizationQueryDto {
  @ApiProperty() @IsString() @IsNotEmpty() client_id!: string;
  @ApiProperty() @IsString() @IsNotEmpty() redirect_uri!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
  @ApiProperty() @IsString() @IsNotEmpty() code_challenge!: string;
  @ApiPropertyOptional({ default: 'S256' })
  @IsOptional()
  @IsString()
  code_challenge_method?: string;
  @ApiPropertyOptional({ default: 'code' })
  @IsOptional()
  @IsString()
  response_type?: string;
  @ApiProperty() @IsString() @IsNotEmpty() resource!: string;
}
