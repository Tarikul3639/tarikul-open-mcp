import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/** Request body for a dashboard OAuth client-grant action. */
export class OAuthClientActionDto {
  @ApiProperty({ description: 'Public OAuth client identifier' })
  @IsString()
  @IsNotEmpty()
  client_id!: string;
}
