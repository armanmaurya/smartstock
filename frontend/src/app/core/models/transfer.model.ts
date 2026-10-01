import { Product } from './product.model';
import { Location } from './location.model';

export type TransferStatus = 'REQUESTED' | 'APPROVED' | 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED';

export interface StockTransferItem {
  id?: number;
  product: Product;
  quantityRequested: number;
  quantityShipped?: number;
  quantityReceived?: number;
}

export interface StockTransfer {
  id?: number;
  transferNumber: string;
  fromLocation: Location;
  toLocation: Location;
  status: TransferStatus;
  notes?: string;
  requestDate: string;
  shippedDate?: string;
  receivedDate?: string;
  items: StockTransferItem[];
}

export interface TransferItemDTO {
  productId: number;
  quantity: number;
}

export interface StockTransferRequestDTO {
  fromLocationId: number;
  toLocationId: number;
  notes?: string;
  items: TransferItemDTO[];
}
