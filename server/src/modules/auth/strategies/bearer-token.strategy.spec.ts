import { describe, expect, it, vi } from 'vitest';

import { BearerTokenStrategy } from './bearer-token.strategy.js';

function setup(grant: { revokedAt: Date | null } | null, valid = true) {
  const accessTokens = {
    verify: vi.fn(async () => {
      if (!valid) throw new Error('bad');
      return { userId: 'u1', clientId: 'c1' };
    }),
  };
  const prisma = {
    mcpClientAccess: { findUnique: vi.fn(async () => grant) },
  };

  return new BearerTokenStrategy(accessTokens as never, prisma as never);
}

describe('BearerTokenStrategy.verify', () => {
  it('reports a missing token', async () => {
    await expect(setup({ revokedAt: null }).verify(undefined)).resolves.toEqual(
      {
        ok: false,
        reason: 'missing_token',
      },
    );
  });

  it('rejects an invalid JWT', async () => {
    await expect(
      setup({ revokedAt: null }, false).verify('Bearer abc'),
    ).resolves.toEqual({ ok: false, reason: 'invalid_token' });
  });

  it('rejects a token whose grant was revoked', async () => {
    await expect(
      setup({ revokedAt: new Date() }).verify('Bearer abc'),
    ).resolves.toEqual({ ok: false, reason: 'invalid_token' });
  });

  it('accepts a valid token with an active grant', async () => {
    await expect(
      setup({ revokedAt: null }).verify('Bearer abc'),
    ).resolves.toEqual({
      ok: true,
      identity: { userId: 'u1', clientId: 'c1', token: 'abc' },
    });
  });
});
