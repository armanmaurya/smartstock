export type LocationType = 'WAREHOUSE' | 'RETAIL_STORE' | 'OUTLET' | 'DISTRIBUTION_CENTER';

export interface Location {
  id?: number;
  code: string;
  name: string;
  type: LocationType;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  active: boolean;
  createdAt?: string;
}
