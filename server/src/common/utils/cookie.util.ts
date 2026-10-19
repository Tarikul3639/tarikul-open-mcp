export function getCookieValue(
  cookieHeader: string | undefined,
  cookieName: string,
): string | undefined {
  const entry = cookieHeader
    ?.split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${cookieName}=`));

  if (!entry) {
    return undefined;
  }

  try {
    return decodeURIComponent(entry.slice(cookieName.length + 1));
  } catch {
    return undefined;
  }
}
