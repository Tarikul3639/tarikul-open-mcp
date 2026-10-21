import { Controller, Get } from '@nestjs/common';
import { WellKnownService } from '../services/well-known.service.js';

@Controller('.well-known')
export class WellKnownController {
  constructor(private readonly wellKnownService: WellKnownService) {}

  @Get('oauth-authorization-server')
  getAuthorizationServerMetadata() {
    return this.wellKnownService.getAuthorizationServerMetadata();
  }

  // RFC 9728 path-suffixed form: /.well-known/oauth-protected-resource/mcp
  // is what the WWW-Authenticate header on /mcp points to.
  @Get(['oauth-protected-resource', 'oauth-protected-resource/mcp'])
  getProtectedResourceMetadata() {
    return this.wellKnownService.getProtectedResourceMetadata();
  }
}
