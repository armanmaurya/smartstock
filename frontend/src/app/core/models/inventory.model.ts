import { Product } from './product.model';
import { Location } from './location.model';

export type MovementType =
  | 'RECEIPT'
  | 'SHIPMENT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'ADJUSTMENT'
  | 'RETURN'
  | 'CYCLE_COUNT';

export type AdjustmentReason =
  | 'DAMAGED_GOODS'
  | 'EXPIRED_STOCK'
  | 'SHRINKAGE_THEFT'
  | 'CYCLE_COUNT_VARIANCE'
  | 'SYSTEM_CORRECTION'
  | 'CUSTOMER_RETURN'
  | 'INITIAL_STOCK_COUNT';

export interface InventoryStock {
  id?: number;
  product: Product;
  location: Location;
  quantityOnHand: number;
  quantityReserved: number;
  availableQuantity?: number;
  reorderPoint: number;
  safetyStock: number;
  maxCapacity?: number;
  aisleBinLocation?: string;
  lastRestockedAt?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
}

export interface StockMovement {
  id?: number;
  product: Product;
  fromLocation?: Location | null;
  toLocation?: Location | null;
  quantity: number;
  movementType: MovementType;
  referenceNumber?: string;
  reason?: string;
  movementDate: string;
  performedBy?: string;
}

export interface StockAdjustmentDTO {
  productId: number;
  locationId: number;
  quantityDelta: number;
  adjustmentReason: AdjustmentReason;
  notes?: string;
  performedBy?: string;
}
