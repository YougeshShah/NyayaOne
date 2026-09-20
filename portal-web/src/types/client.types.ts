export interface Client {
  id: string;
  fullName: string;
  fullNameNepali: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  identificationType: string | null;
  identificationNo: string | null;
  notes: string | null;
  createdAt: string;
  _count?: { cases: number };
}

export interface CreateClientPayload {
  fullName: string;
  fullNameNepali?: string;
  phone?: string;
  email?: string;
  address?: string;
  identificationType?: string;
  identificationNo?: string;
  notes?: string;
}
