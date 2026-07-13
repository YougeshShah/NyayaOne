export type LawFirmStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";

export interface LawFirmListItem {
  id: string;
  name: string;
  email: string | null;
  status: LawFirmStatus;
  registrationNo: string | null;
  stats: {
    totalUsers: number;
    totalClients: number;
    totalCases: number;
  };
  createdAt: string;
}

export interface LawFirmDetail {
  id: string;
  name: string;
  email: string | null;
  status: LawFirmStatus;
  address: string | null;
  phone: string | null;
  registrationNo: string | null;
  approvedAt: string | null;
  createdAt: string;
  users: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    status: string;
    createdAt: string;
  }[];
  _count: {
    users: number;
    clients: number;
    cases: number;
  };
}
