import {
    BadRequestException,
    Controller,
    Delete,
    Get,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { EnvService } from '../../../config/env.service.js';
import { SessionGuard } from '../guards/session.guard.js';
import { CalendarService } from '../services/calendar.service.js';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface.js';

@ApiTags('Google Calendar')
@Controller('auth/calendar')
export class CalendarController {
    constructor(
        private readonly calendarService: CalendarService,
        private readonly env: EnvService,
    ) { }

    @Get('status')
    @UseGuards(SessionGuard)
    @ApiOperation({ summary: 'Get Google Calendar connection status' })
    status(@Req() req: AuthenticatedRequest) {
        return this.calendarService.status(req.user.userId);
    }

    @Post('connect')
    @UseGuards(SessionGuard)
    @ApiOperation({ summary: 'Start Google Calendar OAuth' })
    connect(@Req() req: AuthenticatedRequest) {
        return this.calendarService.connect(req.user.userId);
    }

    @Get('callback')
    @ApiOperation({ summary: 'Handle Google Calendar OAuth callback' })
    async callback(
        @Query('code') code: string,
        @Query('state') state: string,
        @Query('error') error: string,
        @Res() res: Response,
    ) {
        if (error) {
            throw new BadRequestException('Google Calendar authorization was denied');
        }

        await this.calendarService.handleCallback(code, state);

        return res.redirect(302, `${this.env.webOrigin}/dashboard`);
    }

    @Delete('disconnect')
    @UseGuards(SessionGuard)
    @ApiOperation({ summary: 'Disconnect Google Calendar' })
    disconnect(@Req() req: AuthenticatedRequest) {
        return this.calendarService.disconnect(req.user.userId);
    }
}
