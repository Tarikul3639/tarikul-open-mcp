import { Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';

@Injectable()
export class McpService {
  handle(req: Request, res: Response) {
    return res.json({
      status: 'ok',
      message: 'MCP server is running',
    });
  }
}