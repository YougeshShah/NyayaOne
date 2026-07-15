export interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
}

export interface CompanyStaff {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
  role: { id: string; name: string } | null;
  createdAt: string;
}

export interface CreateCompanyStaffPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  roleId: string;
}
