export interface ClientAccess {
  client_id: string;
  client_name: string | null;
  granted_at: string;
  revoked_at: string | null;
}