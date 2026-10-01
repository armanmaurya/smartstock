# StockSmart: Retail Inventory Optimization System

A robust, enterprise-grade Retail Inventory Management & Optimization backend built with **Java 21**, **Spring Boot 3.3.4**, **Spring Data JPA**, and designed for **Oracle DB** (with built-in H2 support for instant out-of-the-box dev/testing).

---

## 🏗️ Standard Java Project Structure

```
inventory/
├── pom.xml                               # Maven project definition & dependencies
├── src/
│   ├── main/
│   │   ├── java/com/armanmaurya/inventory/
│   │   │   ├── InventoryApplication.java # Spring Boot Main Entrypoint
│   │   │   ├── config/                   # Configuration (CORS, Demo Data Seeder)
│   │   │   │   ├── CorsConfig.java
│   │   │   │   └── DataInitializer.java
│   │   │   ├── controller/               # REST API Controllers
│   │   │   │   ├── ProductController.java
│   │   │   │   ├── LocationController.java
│   │   │   │   ├── InventoryController.java
│   │   │   │   ├── StockTransferController.java
│   │   │   │   ├── SupplierController.java
│   │   │   │   ├── PurchaseOrderController.java
│   │   │   │   ├── SalesOrderController.java
│   │   │   │   ├── ScannerController.java
│   │   │   │   └── ReportController.java
│   │   │   ├── dto/                      # Data Transfer Objects
│   │   │   │   ├── ProductDTO.java
│   │   │   │   ├── StockAdjustmentDTO.java
│   │   │   │   ├── StockTransferRequestDTO.java
│   │   │   │   ├── TransferItemDTO.java
│   │   │   │   ├── PurchaseOrderRequestDTO.java
│   │   │   │   ├── PurchaseOrderItemDTO.java
│   │   │   │   ├── PurchaseOrderReceiveDTO.java
│   │   │   │   ├── SalesOrderRequestDTO.java
│   │   │   │   ├── SalesOrderItemDTO.java
│   │   │   │   ├── BarcodeScanResultDTO.java
│   │   │   │   ├── RfidScanRequestDTO.java
│   │   │   │   ├── RfidScanResultDTO.java
│   │   │   │   ├── CycleCountRequestDTO.java
│   │   │   │   ├── DashboardKpiDTO.java
│   │   │   │   └── ReorderRecommendationDTO.java
│   │   │   ├── entity/                   # JPA Domain Entities
│   │   │   │   ├── Product.java
│   │   │   │   ├── Location.java
│   │   │   │   ├── InventoryStock.java
│   │   │   │   ├── StockMovement.java
│   │   │   │   ├── StockTransfer.java
│   │   │   │   ├── StockTransferItem.java
│   │   │   │   ├── Supplier.java
│   │   │   │   ├── PurchaseOrder.java
│   │   │   │   ├── PurchaseOrderItem.java
│   │   │   │   ├── SalesOrder.java
│   │   │   │   ├── SalesOrderItem.java
│   │   │   │   ├── CycleCountAudit.java
│   │   │   │   └── CycleCountAuditItem.java
│   │   │   ├── enums/                    # Business Enumerations
│   │   │   │   ├── LocationType.java
│   │   │   │   ├── MovementType.java
│   │   │   │   ├── TransferStatus.java
│   │   │   │   ├── PurchaseOrderStatus.java
│   │   │   │   ├── SalesOrderStatus.java
│   │   │   │   ├── AdjustmentReason.java
│   │   │   │   └── AuditStatus.java
│   │   │   ├── exception/                # Exception Handling & Problem Details
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   ├── InsufficientStockException.java
│   │   │   │   ├── BusinessException.java
│   │   │   │   ├── ErrorResponse.java
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   ├── repository/               # Spring Data JPA Repositories
│   │   │   │   ├── ProductRepository.java
│   │   │   │   ├── LocationRepository.java
│   │   │   │   ├── InventoryStockRepository.java
│   │   │   │   ├── StockMovementRepository.java
│   │   │   │   ├── StockTransferRepository.java
│   │   │   │   ├── SupplierRepository.java
│   │   │   │   ├── PurchaseOrderRepository.java
│   │   │   │   ├── SalesOrderRepository.java
│   │   │   │   └── CycleCountAuditRepository.java
│   │   │   └── service/                  # Business Logic Layer
│   │   │       ├── ProductService.java
│   │   │       ├── InventoryService.java
│   │   │       ├── SupplierService.java
│   │   │       ├── PurchaseOrderService.java
│   │   │       ├── SalesOrderService.java
│   │   │       ├── ScannerService.java
│   │   │       └── ReportService.java
│   │   └── resources/
│   │       ├── application.properties    # Default profile: H2 in-memory (zero-setup run)
│   │       └── application-oracle.properties # Production profile: Oracle DB
│   └── test/
│       └── java/com/armanmaurya/inventory/
│           └── InventoryApplicationTests.java # End-to-end integration tests
```

---

## ⚡ Core Retail Inventory Features

1. **Product Catalog**:
   - Manage SKUs, brand, category, unit of measure, cost price, and selling price.
   - Built-in uniqueness and indexing on **SKU**, **Barcode**, and **RFID Tag**.
   - Full search across names, SKUs, brands, and categories.

2. **Multi-Location Stock Tracking**:
   - Track physical stock across **Central Distribution Centers**, **Retail Stores**, and **Outlet Stores**.
   - Monitors `quantityOnHand`, `quantityReserved` (for active orders), and calculated `availableQuantity`.
   - Shelf/Bin location mapping (`aisleBinLocation`).
   - Granular stock movement audit trail for every addition, deduction, transfer, and adjustment.

3. **Retail Workflows**:
   - **Inter-store / Warehouse-to-Store Transfers**: Full state machine (`REQUESTED` ➔ `APPROVED` ➔ `IN_TRANSIT` (stock deducted from source) ➔ `RECEIVED` (stock added to destination)).
   - **Stock Adjustments**: Audit reason codes (`DAMAGED_GOODS`, `EXPIRED_STOCK`, `SHRINKAGE_THEFT`, `CYCLE_COUNT_VARIANCE`, `SYSTEM_CORRECTION`).
   - **Customer Sales Order Processing**: Validates stock availability, reserves inventory, and fulfills deduction.

4. **Supplier & Replenishment (PO Processing)**:
   - Supplier management with lead-time tracking and ratings.
   - Purchase order creation and line-item receiving that automatically updates on-hand stock and logs receipts.

5. **Barcode & RFID Scanning**:
   - **Barcode Quick Scan**: `GET /api/scanner/barcode/{barcode}` — Instant lookup of product details, current store stock, and availability across all other company stores.
   - **RFID Batch Scan**: `POST /api/scanner/rfid-batch` — Processes bulk RFID tag reads, tallies counts, identifies mismatches against system stock, and flags unregistered RFID tags.
   - **Cycle Count Audits**: `POST /api/scanner/cycle-count` — Physical stocktake comparison with optional automated variance reconciliation.

6. **KPI & Analytics Reporting**:
   - Total inventory valuation at cost vs retail price.
   - Potential gross profit margin and margin percentage.
   - Real-time Low-stock & Out-of-stock alerts.
   - **Automated Reorder Recommendations**: Computes suggested reorder quantities based on reorder points, safety stocks, maximum capacities, and supplier lead times, categorized by urgency (`CRITICAL`, `HIGH`, `MEDIUM`).

---

## 🔌 API Endpoints Reference

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Products** | `GET` | `/api/products` | List all products (or `?search=query`) |
| | `GET` | `/api/products/{id}` | Get product by ID |
| | `GET` | `/api/products/sku/{sku}` | Lookup by SKU |
| | `GET` | `/api/products/barcode/{barcode}` | Lookup by Barcode |
| | `GET` | `/api/products/rfid/{rfid}` | Lookup by RFID |
| | `POST` | `/api/products` | Create product |
| | `PUT` | `/api/products/{id}` | Update product |
| | `DELETE` | `/api/products/{id}` | Soft-delete product |
| **Locations** | `GET` | `/api/locations` | List all locations |
| | `POST` | `/api/locations` | Create location |
| **Inventory** | `GET` | `/api/inventory` | All stocks across all locations |
| | `GET` | `/api/inventory/location/{id}` | Stocks for a specific store/warehouse |
| | `GET` | `/api/inventory/product/{id}` | Stock across stores for a product |
| | `GET` | `/api/inventory/low-stock` | Low-stock items |
| | `GET` | `/api/inventory/out-of-stock` | Out-of-stock items |
| | `POST` | `/api/inventory/adjust` | Adjust stock with reason & audit trail |
| | `GET` | `/api/inventory/movements` | Recent audit movements log |
| **Transfers** | `GET` | `/api/transfers` | List all inter-store transfers |
| | `POST` | `/api/transfers` | Request a transfer |
| | `PUT` | `/api/transfers/{id}/approve` | Approve transfer |
| | `PUT` | `/api/transfers/{id}/ship` | Ship transfer (deducts source stock) |
| | `PUT` | `/api/transfers/{id}/receive` | Receive transfer (adds target stock) |
| | `PUT` | `/api/transfers/{id}/cancel` | Cancel transfer |
| **Suppliers** | `GET` | `/api/suppliers` | List all suppliers |
| | `POST` | `/api/suppliers` | Add supplier |
| **Purchase Orders**| `GET` | `/api/purchase-orders` | List purchase orders |
| | `POST` | `/api/purchase-orders` | Create PO |
| | `PUT` | `/api/purchase-orders/{id}/issue` | Issue PO to supplier |
| | `POST` | `/api/purchase-orders/{id}/receive` | Receive goods into stock |
| | `PUT` | `/api/purchase-orders/{id}/cancel` | Cancel PO |
| **Sales Orders** | `GET` | `/api/sales-orders` | List sales orders |
| | `POST` | `/api/sales-orders` | Create order & reserve stock |
| | `PUT` | `/api/sales-orders/{id}/fulfill` | Fulfill & deduct stock |
| | `PUT` | `/api/sales-orders/{id}/cancel` | Cancel order & release stock |
| **Scanner** | `GET` | `/api/scanner/barcode/{code}?locationId=X` | Barcode scan & store stock |
| | `POST` | `/api/scanner/rfid-batch` | Bulk RFID scan ingestion |
| | `POST` | `/api/scanner/cycle-count?reconcile=true` | Cycle count audit & reconciliation |
| | `GET` | `/api/scanner/audits` | View audit history |
| **KPI Reports** | `GET` | `/api/reports/kpi` | Real-time valuation & dashboard metrics |
| | `GET` | `/api/reports/reorder-recommendations`| Reorder recommendation engine |

---

## ⚙️ What Is Needed From Your Side (Oracle DB Setup)

The backend is configured to run **out-of-the-box** using an in-memory Oracle-compatible database so you can immediately test all APIs without setup.

When you are ready to connect to your live **Oracle Database**:

1. **Provide Your Oracle Database Credentials** in `src/main/resources/application-oracle.properties`:
   ```properties
   spring.datasource.url=jdbc:oracle:thin:@//<YOUR_HOST>:1521/<SERVICE_NAME_OR_PDB>
   spring.datasource.username=<YOUR_ORACLE_USERNAME>
   spring.datasource.password=<YOUR_ORACLE_PASSWORD>
   ```
   *(Examples: `jdbc:oracle:thin:@//localhost:1521/FREEPDB1` or `XEPDB1`)*

2. **Grant Oracle Privileges** to the database user:
   ```sql
   CREATE USER INVENTORY_USER IDENTIFIED BY inventory_pass;
   GRANT CONNECT, RESOURCE, UNLIMITED TABLESPACE TO INVENTORY_USER;
   ```

3. **Run With The Oracle Profile**:
   ```bash
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=oracle
   ```
   Or set `spring.profiles.active=oracle` in `src/main/resources/application.properties`.

---

## 🐳 Docker Compose Quickstart

Run both **Oracle Database 23c Free** and the **StockSmart Backend** with a single command:

```bash
docker compose up --build
```

### Services Started:
- **`oracle-db`**: Oracle 23c Free listening on port `1521` (healthcheck monitored via `/opt/oracle/checkDBStatus.sh`, with persistent volume `stocksmart_oracle_data`).
- **`backend`**: Spring Boot 3.3.4 Application listening on `http://localhost:8080`, built via multi-stage Java 21 Dockerfile. Automatically waits for Oracle DB to become fully healthy before starting.

### Stopping Containers:
```bash
docker compose down
```
To also purge the database data volume:
```bash
docker compose down -v
```

