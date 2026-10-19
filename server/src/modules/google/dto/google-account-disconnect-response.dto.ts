import { ApiProperty } from '@nestjs/swagger';

/** Result of deleting a Google account connection. */
export class GoogleAccountDisconnectResponseDto {
  @ApiProperty({
    description: 'Number of deleted Google account records',
    example: 1,
  })
  count!: number;
}
