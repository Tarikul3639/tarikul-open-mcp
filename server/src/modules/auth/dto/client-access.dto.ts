import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ClientAccessDto {
  @ApiProperty({
    description: 'OAuth client ID',
    example: 'mcp-client-123',
  })
  @IsString()
  @IsNotEmpty()
  client_id!: string;
}

export class ClientAccessResponseDto {
  @ApiProperty({
    description: 'OAuth client ID',
    example: 'mcp-client-123',
  })
  client_id!: string;

  @ApiProperty({
    description: 'Registered OAuth client name',
    example: 'MCP Calendar Client',
    nullable: true,
  })
  client_name!: string | null;

  @ApiProperty({
    description: 'Date and time when access was granted',
    example: '2026-10-20T10:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  granted_at!: Date;

  @ApiProperty({
    description: 'Date and time when access was revoked',
    example: '2026-10-20T11:00:00.000Z',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  revoked_at!: Date | null;
}
