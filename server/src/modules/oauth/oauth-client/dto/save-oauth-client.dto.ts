import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class SaveOAuthClientDto {
  @ApiProperty({ description: 'Public client identifier' })
  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @ApiProperty({ type: [String], description: 'Allowed redirect URIs' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  redirectUris!: string[];

  @ApiPropertyOptional({ description: 'Human-readable client name' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  clientName?: string;
}
