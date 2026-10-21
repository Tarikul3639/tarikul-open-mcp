/**
 * Helpers for validating redirect targets used by the login and
 * MCP OAuth flows.
 */

const DEFAULT_NEXT_PATH = '/dashboard';
const MAX_NEXT_PATH_LENGTH = 4096;

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

// Schemes that must never be used as an OAuth redirect target.
const FORBIDDEN_SCHEMES = new Set([
    'javascript:',
    'data:',
    'file:',
    'vbscript:',
    'blob:',
    'about:',
    'ftp:',
    'ws:',
    'wss:',
]);

/**
 * Returns a safe, same-origin relative path for post-login redirects.
 * Anything that could leave the web origin (absolute URLs,
 * protocol-relative `//host`, backslash tricks) falls back to the dashboard.
 */
export function sanitizeNextPath(next?: unknown): string {
    if (typeof next !== 'string' || next.length === 0) {
        return DEFAULT_NEXT_PATH;
    }

    if (
        next.length > MAX_NEXT_PATH_LENGTH ||
        !next.startsWith('/') ||
        next.startsWith('//') ||
        next.startsWith('/\\') ||
        hasControlOrBackslash(next)
    ) {
        return DEFAULT_NEXT_PATH;
    }

    return next;
}

function hasControlOrBackslash(value: string): boolean {
    for (let i = 0; i < value.length; i++) {
        const code = value.charCodeAt(i);

        if (code < 0x20 || code === 0x7f || code === 0x5c) {
            return true;
        }
    }

    return false;
}

/**
 * Checks whether a redirect URI is acceptable for client registration.
 *
 * Allowed:
 *  - https:// URLs (web clients such as Claude, ChatGPT)
 *  - http:// only on loopback hosts (desktop / CLI clients, RFC 8252)
 *  - private-use schemes such as cursor:// or vscode:// (native apps)
 *
 * Fragments are never allowed (RFC 6749 §3.1.2).
 */
export function isAllowedRedirectUri(value: unknown): value is string {
    if (typeof value !== 'string' || value.length === 0 || value.length > 2048) {
        return false;
    }

    let url: URL;

    try {
        url = new URL(value);
    } catch {
        return false;
    }

    if (url.hash || value.includes('#')) {
        return false;
    }

    const protocol = url.protocol.toLowerCase();

    if (protocol === 'https:') {
        return Boolean(url.hostname);
    }

    if (protocol === 'http:') {
        return LOOPBACK_HOSTS.has(url.hostname.toLowerCase());
    }

    if (FORBIDDEN_SCHEMES.has(protocol)) {
        return false;
    }

    // Private-use URI scheme (e.g. cursor://, vscode://, com.example.app:/cb)
    return /^[a-z][a-z0-9+.-]*:$/.test(protocol);
}
