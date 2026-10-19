import { Controller, Get, Headers, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { McpService } from './services/mcp.service';

@ApiTags('Model Context Protocol')
@Controller('api/mcp')
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @Get()
  @ApiOperation({ summary: 'MCP Streamable HTTP endpoint (GET transport)' })
  get(
    @Req() request: Request,
    @Res() response: Response,
    @Headers('authorization') authorization?: string,
  ) {
    return this.mcpService.handle(request, response, authorization);
  }

  @Post()
  @ApiOperation({ summary: 'MCP Streamable HTTP endpoint' })
  post(
    @Req() request: Request,
    @Res() response: Response,
    @Headers('authorization') authorization?: string,
  ) {
    return this.mcpService.handle(request, response, authorization);
  }
}
