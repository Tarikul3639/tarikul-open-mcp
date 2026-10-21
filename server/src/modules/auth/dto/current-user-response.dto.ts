import { ApiProperty } from '@nestjs/swagger';

export class CurrentUserResponseDto {
  @ApiProperty({
    description: 'Unique database identifier of the user',
    example: 'cm123abc456',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User display name',
    example: 'John Doe',
    nullable: true,
  })
  name: string | null;

  @ApiProperty({
    description: 'Google profile picture URL',
    example: 'https://example.com/profile.jpg',
    nullable: true,
  })
  picture: string | null;
}
