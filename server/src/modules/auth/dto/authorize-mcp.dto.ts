import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AuthorizeMcpDto {
    @ApiProperty({ example: 'mcp_0123456789abcdef' })
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    client_id: string;

    // Not restricted to http(s): native MCP clients use loopback or
    // private-use schemes (e.g. cursor://). The exact value must match a
    // redirect URI registered for the client.
    @ApiProperty({ example: 'https://claude.ai/api/mcp/auth_callback' })
    @IsString()
    @MinLength(1)
    @MaxLength(2048)
    redirect_uri: string;

    @ApiProperty({ example: 'code' })
    @IsIn(['code'])
    response_type: string;

    @ApiProperty({ example: 'base64url-encoded-challenge' })
    @IsString()
    @MinLength(43)
    @MaxLength(128)
    code_challenge: string;

    @ApiProperty({ example: 'S256' })
    @IsIn(['S256'])
    code_challenge_method: string;

    @ApiPropertyOptional({ example: 'random-state-value' })
    @IsOptional()
    @IsString()
    @MaxLength(2048)
    state?: string;

    // Sent by many MCP clients. Scopes are not enforced yet; accepted so the
    // request is not rejected by the whitelist validation pipe.
    @ApiPropertyOptional({ example: 'calendar' })
    @IsOptional()
    @IsString()
    @MaxLength(1024)
    scope?: string;

    // RFC 8707 resource indicator, sent by MCP clients (spec 2025-06-18+).
    @ApiPropertyOptional({ example: 'http://localhost:5000/mcp' })
    @IsOptional()
    @IsString()
    @MaxLength(2048)
    resource?: string;
}

export class ConsentDecisionDto extends AuthorizeMcpDto {
    @ApiProperty({ enum: ['allow', 'deny'], example: 'allow' })
    @IsIn(['allow', 'deny'])
    decision: 'allow' | 'deny';
}

export class ClientInfoQueryDto {
    @ApiProperty({ example: 'mcp_0123456789abcdef' })
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    client_id: string;

    @ApiProperty({ example: 'https://claude.ai/api/mcp/auth_callback' })
    @IsString()
    @MinLength(1)
    @MaxLength(2048)
    redirect_uri: string;
}
