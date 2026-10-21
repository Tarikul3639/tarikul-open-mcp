import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GoogleProfileDto {
  @ApiProperty({ example: 'google-user-id' })
  sub: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  name?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/profile.jpg',
  })
  picture?: string;
}
