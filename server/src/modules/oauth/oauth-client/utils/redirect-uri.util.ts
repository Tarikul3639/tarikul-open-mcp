export function isSafeRedirectUri(uri: string): boolean {
  try {
    const parsed = new URL(uri);
    return (
      !parsed.hash &&
      (parsed.protocol === 'https:' ||
        (parsed.protocol === 'http:' &&
          ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)))
    );
  } catch {
    return false;
  }
}

export function includesRedirectUri(
  redirectUris: unknown,
  redirectUri: string,
): boolean {
  return (
    Array.isArray(redirectUris) &&
    redirectUris.every((uri) => typeof uri === 'string') &&
    redirectUris.includes(redirectUri)
  );
}
