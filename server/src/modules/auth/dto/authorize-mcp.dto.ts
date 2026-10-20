import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUrl } from 'class-validator';

export class AuthorizeMcpDto {
    @ApiProperty({ example: 'mcp-client-id' })
    @IsString()
    client_id: string;

    @ApiProperty({ example: 'http://localhost:3000/callback' })
    @IsUrl({ require_tld: false })
    redirect_uri: string;

    @ApiProperty({ example: 'code' })
    @IsIn(['code'])
    response_type: string;

    @ApiProperty({ example: 'base64url-encoded-challenge' })
    @IsString()
    code_challenge: string;

    @ApiProperty({ example: 'S256' })
    @IsIn(['S256'])
    code_challenge_method: string;

    @ApiPropertyOptional({ example: 'random-state-value' })
    @IsOptional()
    @IsString()
    state?: string;
}