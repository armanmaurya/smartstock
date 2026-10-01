# StockSmart: Retail Inventory Optimization — Frontend

A modern, high-performance retail inventory management and optimization frontend built with **Angular 22**, **Tailwind CSS v4**, and reactive signals. Perfectly aligned with the **StockSmart Spring Boot 3.3.4 & Oracle DB** backend.

---

## Features & Modules

### 1. Retail Operations Dashboard (`/dashboard`)
- **Key Metrics**: Real-time totals for Active Products/SKUs, Stores & Distribution Centers, Units on Hand, and Pending Inbound/Outbound Orders.
- **Valuation & Margin Analytics**: Inventory valuation at Cost Price vs Retail Price, Potential Gross Margin ($), and Markup %.
- **Stock Health & Alerts**: Instant indicators for Low Stock and Out-of-Stock SKUs with direct restock links.
- **Automated Reorder Recommendations**: Real-time suggestions based on safety thresholds, reorder points, and supplier lead times.
- **Stock Movement Activity Stream**: Live feed of recent receipts, shipments, transfers, and adjustments.

### 2. Product Catalog & SKUs (`/products`)
- Complete product management with SKUs, category, brand, cost price, retail price, and automated markup margin calculations.
- Integrated **UPC/EAN Barcode** and **RFID EPC Tag** tracking.
- Filter and search by product name, SKU, category, brand, and barcode.
- Create, edit, and deactivate products with real-time feedback and modal validation.
- Direct jump buttons to **Barcode Quick Scan** and **Multi-Store Stock Distribution**.

### 3. Multi-Location Stock Tracking (`/inventory`)
- Track inventory across Central Distribution Centers, Flagship Retail Stores, and Outlets.
- Monitors `quantityOnHand`, `quantityReserved` (allocated to active customer orders), and calculated `availableQuantity`.
- Precise **Aisle / Bin Location** tracking for efficient warehouse and shelf picking.
- **Stock Adjustment Modal**: Easily write off damaged items, record customer returns, report shrinkage, or correct physical variances with required audit reason codes (`DAMAGED_GOODS`, `EXPIRED_STOCK`, `SHRINKAGE_THEFT`, `CYCLE_COUNT_VARIANCE`, `SYSTEM_CORRECTION`, `CUSTOMER_RETURN`, `INITIAL_STOCK_COUNT`).
- **Stock Movement Audit Log**: Immutable ledger recording timestamp, product, source location, target location, quantity delta, reference number, reason, and operator.

### 4. Retail Facilities & Hubs (`/locations`)
- Centralized management for Warehouses, Distribution Centers, Retail Stores, and Outlets.
- Facility details: Code, Name, Address, City/State/ZIP, Phone, Email, and Operational status.
- Add new locations or update contact details and address mapping.
- Direct shortcut to view inventory allocated to each facility.

### 5. Inter-Store Stock Transfers (`/transfers`)
- Full lifecycle state machine:
  `REQUESTED` → `APPROVED` → `IN_TRANSIT` (deducts stock from source) → `RECEIVED` (adds stock to destination) (or `CANCELLED`).
- Multi-item transfer requests with quantity checks and origin-destination validation.
- Interactive status timeline and action buttons corresponding to each stage in the retail transfer workflow.

### 6. Supplier Directory (`/suppliers`)
- Vendor directory tracking contact person, email, phone, location, and payment terms (e.g. Net 30, Net 45).
- **Lead Time Days** tracking for dynamic replenishment modeling.
- Supplier performance ratings (1 to 5 stars).
- One-click "Create PO" shortcut pre-filling supplier details.

### 7. Inbound Purchase Orders (`/purchase-orders`)
- Create replenishment purchase orders with dynamic line items, auto-filling unit cost prices and calculating line subtotals.
- **PO Workflow**: `DRAFT` → `ISSUED` → `PARTIALLY_RECEIVED` → `COMPLETED` (or `CANCELLED`).
- **Interactive Check-In / Goods Receipt Modal**: Warehouse teams can record received quantities item-by-item, updating on-hand store inventory immediately.

### 8. Customer Sales Orders (`/sales-orders`)
- Retail POS and customer order intake with automatic stock reservation.
- Lifecycle: `PENDING` → `CONFIRMED` → `PACKED` → `SHIPPED` → `DELIVERED` (or `CANCELLED`).
- **Fulfillment**: Deducts reserved inventory upon fulfillment or releases reservation if cancelled.

### 9. Barcode & RFID Scanner Hub (`/scanner`)
- **Barcode Quick Scan**: Instant product lookup by barcode, displaying local store stock, aisle/bin, and a company-wide **Multi-Store Stock Availability Matrix**.
- **Handheld RFID Batch Reader**: Simulates bulk RFID EPC tag reading from handheld readers (Zebra, Impinj). Flags unrecognized tags and groups identified products with variance vs system stock.
- **Physical Cycle Count Audit**: Conduct physical stocktakes by store and line items. Supports the **Auto-Reconcile** flag (`reconcile=true`) to automatically synchronize system stock with physical counts.
- **Audit Log History**: Review historical cycle count audits and reconciliation statuses.

### 10. Inventory Optimization Reports (`/reports`)
- Comprehensive financial valuation at cost vs retail price with profit margin potential.
- Inventory Health ratio visualizer.
- **Reorder Recommendation Engine**: Categorizes replenishment needs into `CRITICAL`, `HIGH`, and `MEDIUM` urgency, with suggested reorder quantities based on reorder points, safety stock, maximum facility capacities, and supplier lead times.

---

## Quickstart

### 1. Start the Spring Boot Backend
From your backend directory:
```bash
cd /home/hunterx/Downloads/inventory
./mvnw spring-boot:run
```
*The backend starts on `http://localhost:8080` with sample retail data pre-seeded in H2 / Oracle DB.*

### 2. Start the Frontend Development Server
From this directory:
```bash
npm start
# or
ng serve
```
Navigate to `http://localhost:4200/`.

### 3. Build for Production
```bash
npm run build
```
Compiled server and browser assets will be output to `dist/frontend`.

---

## API Configuration
The frontend connects to the Spring Boot REST API at `http://localhost:8080/api` configured in:
`src/app/core/services/api-config.ts`
