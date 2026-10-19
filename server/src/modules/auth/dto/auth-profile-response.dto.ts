import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthProfileResponseDto {
  @ApiPropertyOptional({ nullable: true })
  name!: string | null;

  @ApiProperty()
  email!: string;

  @ApiPropertyOptional({ nullable: true })
  picture!: string | null;
}
