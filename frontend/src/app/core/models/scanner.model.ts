import { Product } from './product.model';
import { Location } from './location.model';

export interface LocationStockSummary {
  locationId: number;
  locationCode: string;
  locationName: string;
  locationType: string;
  quantityOnHand: number;
  quantityReserved: number;
  availableQuantity: number;
  aisleBinLocation?: string;
  isLowStock?: boolean;
}

export interface BarcodeScanResultDTO {
  found: boolean;
  scannedBarcode: string;
  product?: Product;
  totalStockAcrossLocations?: number;
  currentStoreStock?: LocationStockSummary;
  allLocationsStock?: LocationStockSummary[];
  lowStockAlert?: boolean;
}

export interface RfidScanRequestDTO {
  locationId: number;
  rfidTags: string[];
  operator?: string;
}

export interface RfidProductGroup {
  product: Product;
  scannedCount: number;
  systemOnHand: number;
  variance: number;
  aisleBinLocation?: string;
}

export interface RfidScanResultDTO {
  locationId: number;
  locationName: string;
  totalTagsScanned: number;
  recognizedTagsCount: number;
  unknownTagsCount: number;
  unknownTags: string[];
  identifiedProducts: RfidProductGroup[];
}

export type AuditStatus = 'IN_PROGRESS' | 'COMPLETED' | 'RECONCILED';

export interface CycleCountAuditItem {
  id?: number;
  product: Product;
  systemQuantity: number;
  countedQuantity: number;
  variance: number;
}

export interface CycleCountAudit {
  id?: number;
  auditNumber: string;
  location: Location;
  status: AuditStatus;
  notes?: string;
  auditDate: string;
  reconciledDate?: string;
  items: CycleCountAuditItem[];
}

export interface CycleCountItemDTO {
  productId: number;
  countedQuantity: number;
}

export interface CycleCountRequestDTO {
  locationId: number;
  notes?: string;
  items: CycleCountItemDTO[];
}
