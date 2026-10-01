export interface Product {
  id?: number;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  costPrice: number;
  sellingPrice: number;
  barcode: string;
  rfidTag?: string;
  unitOfMeasure?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductDTO {
  id?: number;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  costPrice: number;
  sellingPrice: number;
  barcode: string;
  rfidTag?: string;
  unitOfMeasure?: string;
  active?: boolean;
}
