import { Supplier } from './supplier.model';
import { Location } from './location.model';
import { Product } from './product.model';

export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'PARTIALLY_RECEIVED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface PurchaseOrderItem {
  id?: number;
  product: Product;
  quantityOrdered: number;
  quantityReceived: number;
  unitPrice: number;
}

export interface PurchaseOrder {
  id?: number;
  poNumber: string;
  supplier: Supplier;
  destinationLocation: Location;
  orderDate: string;
  expectedDeliveryDate?: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  notes?: string;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItemDTO {
  productId: number;
  quantityOrdered: number;
  unitPrice: number;
}

export interface PurchaseOrderRequestDTO {
  supplierId: number;
  destinationLocationId: number;
  expectedDeliveryDate?: string;
  notes?: string;
  items: PurchaseOrderItemDTO[];
}

export interface ReceiveItem {
  productId: number;
  quantityReceived: number;
}

export interface PurchaseOrderReceiveDTO {
  receivedBy?: string;
  notes?: string;
  items: ReceiveItem[];
}
