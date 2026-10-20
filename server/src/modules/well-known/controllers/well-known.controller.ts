import { Controller, Get } from '@nestjs/common';
import { WellKnownService } from '../services/well-known.service';

@Controller('.well-known')
export class WellKnownController {
    constructor(private readonly wellKnownService: WellKnownService) { }

    @Get('oauth-authorization-server')
    getAuthorizationServerMetadata() {
        return this.wellKnownService.getAuthorizationServerMetadata();
    }

    @Get('oauth-protected-resource')
    getProtectedResourceMetadata() {
        return this.wellKnownService.getProtectedResourceMetadata();
    }
}