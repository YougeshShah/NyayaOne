export interface Court {
  id: string;
  name: string;
  nepaliName: string | null;
  type: string;
  province: string | null;
  location: string | null;
  isActive: boolean;
}
