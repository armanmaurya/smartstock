import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'StockSmart — Retail Operations Dashboard'
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products/product-list.component').then(m => m.ProductListComponent),
    title: 'StockSmart — Product Catalog & SKUs'
  },
  {
    path: 'inventory',
    loadComponent: () =>
      import('./pages/inventory/inventory-list.component').then(m => m.InventoryListComponent),
    title: 'StockSmart — Multi-Location Stock Tracking'
  },
  {
    path: 'locations',
    loadComponent: () =>
      import('./pages/locations/location-list.component').then(m => m.LocationListComponent),
    title: 'StockSmart — Retail Facilities & Hubs'
  },
  {
    path: 'transfers',
    loadComponent: () =>
      import('./pages/transfers/transfer-list.component').then(m => m.TransferListComponent),
    title: 'StockSmart — Inter-Store Stock Transfers'
  },
  {
    path: 'suppliers',
    loadComponent: () =>
      import('./pages/suppliers/supplier-list.component').then(m => m.SupplierListComponent),
    title: 'StockSmart — Supplier Directory'
  },
  {
    path: 'purchase-orders',
    loadComponent: () =>
      import('./pages/purchase-orders/po-list.component').then(m => m.PoListComponent),
    title: 'StockSmart — Inbound Purchase Orders'
  },
  {
    path: 'sales-orders',
    loadComponent: () =>
      import('./pages/sales-orders/sales-order-list.component').then(m => m.SalesOrderListComponent),
    title: 'StockSmart — Customer Sales Orders'
  },
  {
    path: 'scanner',
    loadComponent: () =>
      import('./pages/scanner/scanner-hub.component').then(m => m.ScannerHubComponent),
    title: 'StockSmart — Barcode & RFID Scanner Hub'
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./pages/reports/reports.component').then(m => m.ReportsComponent),
    title: 'StockSmart — Inventory Optimization Reports'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
