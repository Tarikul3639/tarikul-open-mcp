import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';

export class McpTokenDto {
    @ApiProperty({
        enum: ['authorization_code', 'refresh_token'],
        example: 'authorization_code',
    })
    @IsIn(['authorization_code', 'refresh_token'])
    grant_type: 'authorization_code' | 'refresh_token';

    @ApiProperty({ example: 'mcp-client-id' })
    @IsString()
    client_id: string;

    @ApiPropertyOptional({ example: 'authorization-code' })
    @ValidateIf((o: McpTokenDto) => o.grant_type === 'authorization_code')
    @IsString()
    code?: string;

    @ApiPropertyOptional({ example: 'http://localhost:3000/callback' })
    @ValidateIf((o: McpTokenDto) => o.grant_type === 'authorization_code')
    @IsUrl({ require_tld: false })
    redirect_uri?: string;

    @ApiPropertyOptional({ example: 'pkce-code-verifier' })
    @ValidateIf((o: McpTokenDto) => o.grant_type === 'authorization_code')
    @IsString()
    code_verifier?: string;

    @ApiPropertyOptional({ example: 'refresh-token-value' })
    @ValidateIf((o: McpTokenDto) => o.grant_type === 'refresh_token')
    @IsString()
    refresh_token?: string;
}
