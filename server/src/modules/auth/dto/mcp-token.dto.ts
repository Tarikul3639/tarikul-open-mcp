import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class McpTokenDto {
    @ApiProperty({
        enum: ['authorization_code', 'refresh_token'],
        example: 'authorization_code',
    })
    @IsIn(['authorization_code', 'refresh_token'])
    grant_type: 'authorization_code' | 'refresh_token';

    // Optional in the body when the client uses HTTP Basic authentication
    // (client_secret_basic); the controller fills it from the header.
    @ApiPropertyOptional({ example: 'mcp_0123456789abcdef' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    client_id?: string;

    @ApiPropertyOptional({ description: 'Only for confidential clients' })
    @IsOptional()
    @IsString()
    @MaxLength(512)
    client_secret?: string;

    @ApiPropertyOptional({ example: 'authorization-code' })
    @ValidateIf((o: McpTokenDto) => o.grant_type === 'authorization_code')
    @IsString()
    code?: string;

    @ApiPropertyOptional({ example: 'https://claude.ai/api/mcp/auth_callback' })
    @ValidateIf((o: McpTokenDto) => o.grant_type === 'authorization_code')
    @IsString()
    @MaxLength(2048)
    redirect_uri?: string;

    @ApiPropertyOptional({ example: 'pkce-code-verifier' })
    @ValidateIf((o: McpTokenDto) => o.grant_type === 'authorization_code')
    @IsString()
    code_verifier?: string;

    @ApiPropertyOptional({ example: 'refresh-token-value' })
    @ValidateIf((o: McpTokenDto) => o.grant_type === 'refresh_token')
    @IsString()
    refresh_token?: string;

    // Accepted for compatibility with MCP clients; not enforced yet.
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(1024)
    scope?: string;

    // RFC 8707 resource indicator.
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(2048)
    resource?: string;
}
