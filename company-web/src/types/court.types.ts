export interface Court {
  id: string;
  name: string;
  nepaliName: string | null;
  type: string;
  province: string | null;
  location: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourtPayload {
  name: string;
  nepaliName?: string;
  type: string;
  province?: string;
  location?: string;
}
