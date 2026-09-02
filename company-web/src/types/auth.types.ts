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
  roleName?: string | null;
  permissions?: string[] | null; // null = unrestricted (Super Admin or no role assigned yet)
}

export interface LoginPayload {
  email: string;
  password: string;
  asCompany?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}
