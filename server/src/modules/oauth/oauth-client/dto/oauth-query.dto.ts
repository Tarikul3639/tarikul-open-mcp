import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class OAuthClientQueryDto {
  @ApiProperty({ description: 'Public OAuth client identifier' })
  @IsString()
  @IsNotEmpty()
  clientId!: string;
}
