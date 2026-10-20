import { ApiProperty } from '@nestjs/swagger';
import { GoogleProfileDto } from './google-profile.dto';

export class GoogleAuthResponseDto {
    @ApiProperty({
        example: 'Google authentication successful',
    })
    message: string;

    @ApiProperty({ type: GoogleProfileDto })
    user: GoogleProfileDto;
}