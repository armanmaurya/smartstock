export interface Supplier {
  id?: number;
  code: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  leadTimeDays: number;
  paymentTerms?: string;
  rating?: number;
  active: boolean;
  createdAt?: string;
}
