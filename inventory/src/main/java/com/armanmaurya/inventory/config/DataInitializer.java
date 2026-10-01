package com.armanmaurya.inventory.config;

import com.armanmaurya.inventory.entity.*;
import com.armanmaurya.inventory.enums.*;
import com.armanmaurya.inventory.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final LocationRepository locationRepository;
    private final InventoryStockRepository stockRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final StockMovementRepository movementRepository;

    public DataInitializer(ProductRepository productRepository,
                           LocationRepository locationRepository,
                           InventoryStockRepository stockRepository,
                           SupplierRepository supplierRepository,
                           PurchaseOrderRepository purchaseOrderRepository,
                           SalesOrderRepository salesOrderRepository,
                           StockMovementRepository movementRepository) {
        this.productRepository = productRepository;
        this.locationRepository = locationRepository;
        this.stockRepository = stockRepository;
        this.supplierRepository = supplierRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.salesOrderRepository = salesOrderRepository;
        this.movementRepository = movementRepository;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) {
            return; // Data already exists
        }

        // 1. Create Retail Locations
        Location warehouse = new Location("LOC-WH-01", "Central Distribution Center", LocationType.WAREHOUSE,
                "1200 Logistics Pkwy", "Chicago", "IL", "60607", "+1-312-555-0100", "warehouse@stocksmart.com");
        Location flagshipStore = new Location("LOC-STORE-01", "Downtown Flagship Store", LocationType.RETAIL_STORE,
                "500 Michigan Ave", "Chicago", "IL", "60611", "+1-312-555-0101", "flagship@stocksmart.com");
        Location galleriaStore = new Location("LOC-STORE-02", "Galleria Mall Store", LocationType.RETAIL_STORE,
                "750 Galleria Blvd", "Naperville", "IL", "60540", "+1-630-555-0102", "galleria@stocksmart.com");
        Location outletStore = new Location("LOC-OUTLET-01", "O'Hare Premium Outlet", LocationType.OUTLET,
                "5220 Fashion Way", "Rosemont", "IL", "60018", "+1-847-555-0103", "outlet@stocksmart.com");

        locationRepository.saveAll(List.of(warehouse, flagshipStore, galleriaStore, outletStore));

        // 2. Create Suppliers
        Supplier sup1 = new Supplier("SUP-101", "Apex Retail Distributors", "Sarah Jenkins",
                "sarah.jenkins@apexretail.com", "+1-800-555-7711", "900 Industrial Rd", "Atlanta", "USA", 5, "Net 30");
        Supplier sup2 = new Supplier("SUP-102", "OmniTech Global Hardware", "David Chen",
                "david.chen@omnitech.com", "+1-800-555-8822", "450 Silicon Ave", "San Jose", "USA", 7, "Net 45");
        Supplier sup3 = new Supplier("SUP-103", "Horizon Apparel & Goods", "Elena Rossi",
                "elena@horizontextiles.com", "+1-800-555-9933", "12 Fashion Blvd", "New York", "USA", 10, "Net 30");

        supplierRepository.saveAll(List.of(sup1, sup2, sup3));

        // 3. Create Products with Barcode & RFID
        Product p1 = new Product("SKU-TECH-001", "Noise-Cancelling Wireless Headphones", "Electronics", "SoundWave",
                new BigDecimal("45.00"), new BigDecimal("99.99"), "8901234560011", "E28011606000020478140001", "EA");
        Product p2 = new Product("SKU-TECH-002", "Smart Fitness Tracker Watch", "Electronics", "PulseTech",
                new BigDecimal("65.00"), new BigDecimal("149.99"), "8901234560028", "E28011606000020478140002", "EA");
        Product p3 = new Product("SKU-APP-101", "Vintage Denim Jacket", "Apparel", "UrbanStitch",
                new BigDecimal("28.00"), new BigDecimal("79.99"), "8901234560035", "E28011606000020478140003", "EA");
        Product p4 = new Product("SKU-APP-102", "Organic Cotton Crewneck T-Shirt", "Apparel", "UrbanStitch",
                new BigDecimal("8.50"), new BigDecimal("24.99"), "8901234560042", "E28011606000020478140004", "EA");
        Product p5 = new Product("SKU-FOOT-201", "AeroStride Pro Running Shoes", "Footwear", "AeroStride",
                new BigDecimal("42.00"), new BigDecimal("109.99"), "8901234560059", "E28011606000020478140005", "PAIR");
        Product p6 = new Product("SKU-ACC-301", "RFID-Blocking Leather Bifold Wallet", "Accessories", "VaultSafe",
                new BigDecimal("12.50"), new BigDecimal("34.99"), "8901234560066", "E28011606000020478140006", "EA");
        Product p7 = new Product("SKU-TECH-003", "65W GaN Fast Wall Charger", "Electronics", "ChargePro",
                new BigDecimal("14.00"), new BigDecimal("39.99"), "8901234560073", "E28011606000020478140007", "EA");

        productRepository.saveAll(List.of(p1, p2, p3, p4, p5, p6, p7));

        // 4. Create Multi-Location Inventory Stock
        // Warehouse Stocks
        InventoryStock s1_wh = new InventoryStock(p1, warehouse, 120, 30, 15, "Aisle A, Bin 101");
        InventoryStock s2_wh = new InventoryStock(p2, warehouse, 90, 25, 10, "Aisle A, Bin 102");
        InventoryStock s3_wh = new InventoryStock(p3, warehouse, 180, 40, 20, "Aisle B, Bin 201");
        InventoryStock s4_wh = new InventoryStock(p4, warehouse, 350, 60, 30, "Aisle B, Bin 202");
        InventoryStock s5_wh = new InventoryStock(p5, warehouse, 110, 25, 15, "Aisle C, Bin 301");
        InventoryStock s6_wh = new InventoryStock(p6, warehouse, 200, 30, 20, "Aisle D, Bin 401");
        InventoryStock s7_wh = new InventoryStock(p7, warehouse, 140, 30, 15, "Aisle A, Bin 103");

        // Downtown Flagship Store Stocks (with some low stock to test alerts!)
        InventoryStock s1_flag = new InventoryStock(p1, flagshipStore, 4, 10, 5, "Floor Display #1"); // LOW STOCK ALERT
        InventoryStock s2_flag = new InventoryStock(p2, flagshipStore, 18, 12, 5, "Display Cabinet B");
        InventoryStock s3_flag = new InventoryStock(p3, flagshipStore, 25, 15, 8, "Rack #4");
        InventoryStock s4_flag = new InventoryStock(p4, flagshipStore, 45, 20, 10, "Table #2");
        InventoryStock s5_flag = new InventoryStock(p5, flagshipStore, 3, 10, 4, "Footwear Wall"); // LOW STOCK ALERT
        InventoryStock s6_flag = new InventoryStock(p6, flagshipStore, 30, 10, 5, "Register Stand");
        InventoryStock s7_flag = new InventoryStock(p7, flagshipStore, 0, 10, 5, "Accessory Peg #7"); // OUT OF STOCK ALERT

        // Galleria Mall Store Stocks
        InventoryStock s1_gal = new InventoryStock(p1, galleriaStore, 12, 8, 4, "Showcase 1");
        InventoryStock s2_gal = new InventoryStock(p2, galleriaStore, 15, 10, 5, "Showcase 2");
        InventoryStock s3_gal = new InventoryStock(p3, galleriaStore, 20, 12, 6, "Apparel Rack 1");
        InventoryStock s4_gal = new InventoryStock(p4, galleriaStore, 35, 15, 8, "Apparel Table");
        InventoryStock s5_gal = new InventoryStock(p5, galleriaStore, 14, 8, 4, "Shoe Wall");
        InventoryStock s6_gal = new InventoryStock(p6, galleriaStore, 2, 8, 4, "Counter Display"); // LOW STOCK ALERT
        InventoryStock s7_gal = new InventoryStock(p7, galleriaStore, 16, 8, 4, "Shelf A");

        stockRepository.saveAll(List.of(
                s1_wh, s2_wh, s3_wh, s4_wh, s5_wh, s6_wh, s7_wh,
                s1_flag, s2_flag, s3_flag, s4_flag, s5_flag, s6_flag, s7_flag,
                s1_gal, s2_gal, s3_gal, s4_gal, s5_gal, s6_gal, s7_gal
        ));

        // 5. Stock Movement Audit Trail
        StockMovement m1 = new StockMovement(p1, null, warehouse, 150, MovementType.RECEIPT, "PO-INIT-001", "Initial stock intake", "ADMIN");
        StockMovement m2 = new StockMovement(p1, warehouse, flagshipStore, 30, MovementType.TRANSFER_IN, "TRF-INIT-001", "Replenishment dispatch", "LOGISTICS");
        StockMovement m3 = new StockMovement(p7, flagshipStore, null, 2, MovementType.ADJUSTMENT, "ADJ-INIT-001", "Damaged demo unit during showcase", "STORE_MGR");
        movementRepository.saveAll(List.of(m1, m2, m3));

        // 6. Sample Purchase Order
        PurchaseOrder po = new PurchaseOrder("PO-2026-0001", sup1, warehouse, LocalDate.now().plusDays(5), "Urgent restock for fall promotion");
        po.setStatus(PurchaseOrderStatus.ISSUED);
        po.addItem(new PurchaseOrderItem(p1, 50, new BigDecimal("43.50")));
        po.addItem(new PurchaseOrderItem(p7, 100, new BigDecimal("13.00")));
        purchaseOrderRepository.save(po);

        // 7. Sample Sales Order
        SalesOrder so = new SalesOrder("SO-2026-0001", flagshipStore, "Michael Vance", "michael.vance@example.com");
        so.setStatus(SalesOrderStatus.DELIVERED);
        so.addItem(new SalesOrderItem(p1, 1, new BigDecimal("99.99")));
        so.addItem(new SalesOrderItem(p6, 1, new BigDecimal("34.99")));
        salesOrderRepository.save(so);
    }
}
