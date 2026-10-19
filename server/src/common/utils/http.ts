import type { Request, Response } from 'express';

export const cookies = (req: Request) =>
  Object.fromEntries(
    (req.headers.cookie || '')
      .split(';')
      .map((x) => x.trim().split(/=(.*)/s))
      .filter((x) => x.length > 1)
      .map(([k, v]) => [k, decodeURIComponent(v)]),
  );
export const noCache = (res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
};
export const oauthCors = (res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
};
export const safeNext = (value: string | undefined) =>
  value?.startsWith('/') && !value.startsWith('//') && !value.includes('\\')
    ? value
    : '/';
