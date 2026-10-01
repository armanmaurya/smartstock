import { Location } from './location.model';
import { Product } from './product.model';

export type SalesOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface SalesOrderItem {
  id?: number;
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface SalesOrder {
  id?: number;
  orderNumber: string;
  location: Location;
  customerName?: string;
  customerEmail?: string;
  orderDate: string;
  status: SalesOrderStatus;
  totalAmount: number;
  items: SalesOrderItem[];
}

export interface SalesOrderItemDTO {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface SalesOrderRequestDTO {
  locationId: number;
  customerName: string;
  customerEmail?: string;
  items: SalesOrderItemDTO[];
}
