export interface Client {
  id: string;
  fullName: string;
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
  phone?: string;
  email?: string;
  address?: string;
  identificationType?: string;
  identificationNo?: string;
  notes?: string;
}
