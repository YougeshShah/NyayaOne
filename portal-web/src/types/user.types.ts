export type StaffAccountType = "LAWYER" | "STAFF";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";

export interface FirmUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  accountType: StaffAccountType;
  status: UserStatus;
  barRegistrationNo: string | null;
  specialization: string | null;
  createdAt: string;
}

export interface CreateFirmUserPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  accountType: StaffAccountType;
  barRegistrationNo?: string;
  specialization?: string;
  roleId?: string;
}

export interface UpdateFirmUserPayload {
  fullName?: string;
  phone?: string;
  barRegistrationNo?: string;
  specialization?: string;
}
