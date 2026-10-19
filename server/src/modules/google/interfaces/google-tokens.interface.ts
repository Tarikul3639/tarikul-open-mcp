export interface GoogleTokens {
  access_token?: string | null;
  refresh_token?: string | null;
  expiry_date?: number | null;
  scope?: string | null;
}

export interface GoogleUser {
  name?: string | null;
  email?: string | null;
  picture?: string | null;
}
