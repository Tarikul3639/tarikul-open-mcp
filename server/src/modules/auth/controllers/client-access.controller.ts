import {
    Body,
    Controller,
    Delete,
    Get,
    Post,
    Req,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';
import {
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { SessionGuard } from '../guards/session.guard';
import { ClientAccessService } from '../services/client-access.service';
import {
    ClientAccessDto,
    ClientAccessResponseDto,
} from '../dto/client-access.dto';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@ApiTags('Client Access')
@Controller('auth/clients')
@UseGuards(SessionGuard)
export class ClientAccessController {
    constructor(
        private readonly clientAccessService: ClientAccessService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'List authenticated user client access' })
    @ApiOkResponse({
        description: 'Client access list retrieved successfully',
        type: ClientAccessResponseDto,
        isArray: true,
    })
    findAll(@Req() req: AuthenticatedRequest) {
        return this.clientAccessService.findAll(req.user.userId);
    }

    @Post()
    @ApiOperation({ summary: 'Restore client access' })
    @ApiBody({ type: ClientAccessDto })
    @ApiOkResponse({
        description: 'Client access restored successfully',
    })
    restore(
        @Req() req: AuthenticatedRequest,
        @Body('client_id') clientId: string,
    ) {
        if (!clientId?.trim()) {
            throw new BadRequestException('client_id is required');
        }

        return this.clientAccessService.restore(
            req.user.userId,
            clientId,
        );
    }

    @Delete()
    @ApiOperation({ summary: 'Revoke client access' })
    @ApiBody({ type: ClientAccessDto })
    @ApiOkResponse({
        description: 'Client access revoked successfully',
    })
    revoke(
        @Req() req: AuthenticatedRequest,
        @Body('client_id') clientId: string,
    ) {
        if (!clientId?.trim()) {
            throw new BadRequestException('client_id is required');
        }

        return this.clientAccessService.revoke(
            req.user.userId,
            clientId,
        );
    }
}