export interface Court {
  id: string;
  name: string;
  type: string;
  province: string | null;
  location: string | null;
  isActive: boolean;
}
