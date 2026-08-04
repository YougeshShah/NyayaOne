export type AccountType = "COMPANY" | "LAW_FIRM_ADMIN" | "LAWYER" | "STAFF" | "CLIENT";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  accountType: AccountType;
  lawFirmId: string | null;
  lawFirmStatus: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}
