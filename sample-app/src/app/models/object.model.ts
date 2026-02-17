export interface ApiObject {
  id: string;
  name: string;
  data?: {
    color?: string;
    capacity?: string;
  };
}
