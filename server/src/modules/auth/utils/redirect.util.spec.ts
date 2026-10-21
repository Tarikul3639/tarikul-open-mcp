import { describe, expect, it } from 'vitest';

import { isAllowedRedirectUri, sanitizeNextPath } from './redirect.util.js';

describe('sanitizeNextPath', () => {
  it('keeps safe relative paths', () => {
    expect(sanitizeNextPath('/oauth/consent?client_id=a&state=b')).toBe(
      '/oauth/consent?client_id=a&state=b',
    );
  });

  it.each([
    undefined,
    '',
    'https://evil.com',
    '//evil.com/x',
    '/\\evil.com',
    'dashboard',
    '/ok\nSet-Cookie: x',
    '/a\\b',
  ])('falls back to /dashboard for %j', (value) => {
    expect(sanitizeNextPath(value)).toBe('/dashboard');
  });
});

describe('isAllowedRedirectUri', () => {
  it.each([
    'https://claude.ai/api/mcp/auth_callback',
    'http://localhost:6274/oauth/callback',
    'http://127.0.0.1:33418/callback',
    'http://[::1]:8080/cb',
    'cursor://anysphere.cursor-retrieval/oauth/callback',
    'vscode://vscode.github-authentication/did-authenticate',
  ])('allows %s', (uri) => {
    expect(isAllowedRedirectUri(uri)).toBe(true);
  });

  it.each([
    'http://evil.com/cb',
    'javascript:alert(1)',
    'data:text/html,hi',
    'file:///etc/passwd',
    'https://app.example.com/cb#frag',
    'not a url',
    '',
    42,
  ])('rejects %j', (uri) => {
    expect(isAllowedRedirectUri(uri)).toBe(false);
  });
});
