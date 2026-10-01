import { InventoryStock, StockMovement } from './inventory.model';

export interface ReorderRecommendationDTO {
  productId: number;
  sku: string;
  productName: string;
  category?: string;
  locationId: number;
  locationName: string;
  currentStock: number;
  reorderPoint: number;
  safetyStock: number;
  suggestedReorderQuantity: number;
  estimatedCost: number;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  supplierId?: number;
  supplierName?: string;
  supplierLeadTimeDays?: number;
}

export interface DashboardKpiDTO {
  totalProducts: number;
  totalLocations: number;
  totalStockUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalCostValuation: number;
  totalRetailValuation: number;
  potentialGrossMargin: number;
  marginPercentage: number;
  pendingPurchaseOrders: number;
  pendingSalesOrders: number;
  lowStockAlerts: InventoryStock[];
  reorderRecommendations: ReorderRecommendationDTO[];
  recentMovements: StockMovement[];
}
