package com.armanmaurya.inventory;

import com.armanmaurya.inventory.dto.*;
import com.armanmaurya.inventory.entity.Product;
import com.armanmaurya.inventory.entity.StockTransfer;
import com.armanmaurya.inventory.enums.AdjustmentReason;
import com.armanmaurya.inventory.enums.TransferStatus;
import com.armanmaurya.inventory.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class InventoryApplicationTests {

    @Autowired
    private ProductService productService;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private ScannerService scannerService;

    @Autowired
    private ReportService reportService;

    @Test
    void contextLoads() {
        assertNotNull(productService);
        assertNotNull(inventoryService);
        assertNotNull(scannerService);
        assertNotNull(reportService);
    }

    @Test
    void testBarcodeScanning() {
        // Scans seeded headphone barcode "8901234560011"
        BarcodeScanResultDTO result = scannerService.scanBarcode("8901234560011", 2L);
        assertTrue(result.isFound());
        assertEquals("SKU-TECH-001", result.getProduct().getSku());
        assertNotNull(result.getAllLocationsStock());
        assertFalse(result.getAllLocationsStock().isEmpty());
    }

    @Test
    void testRfidBatchScan() {
        RfidScanRequestDTO request = new RfidScanRequestDTO(
                1L,
                List.of("E28011606000020478140001", "E28011606000020478140002", "UNKNOWN_TAG_999"),
                "TEST_OPERATOR"
        );
        RfidScanResultDTO scanResult = scannerService.scanRfidBatch(request);
        assertEquals(3, scanResult.getTotalTagsScanned());
        assertEquals(2, scanResult.getRecognizedTagsCount());
        assertEquals(1, scanResult.getUnknownTagsCount());
        assertTrue(scanResult.getUnknownTags().contains("UNKNOWN_TAG_999"));
    }

    @Test
    void testStockAdjustment() {
        ProductDTO newProd = new ProductDTO();
        newProd.setSku("SKU-TEST-999");
        newProd.setName("Test Smart Device");
        newProd.setCategory("Electronics");
        newProd.setBrand("TestBrand");
        newProd.setCostPrice(new BigDecimal("10.00"));
        newProd.setSellingPrice(new BigDecimal("20.00"));
        newProd.setBarcode("9991112223334");
        newProd.setRfidTag("E28011606000020478149999");
        Product created = productService.createProduct(newProd);

        StockAdjustmentDTO adj = new StockAdjustmentDTO(
                created.getId(),
                1L,
                25,
                AdjustmentReason.INITIAL_STOCK_COUNT,
                "Test stock onboarding",
                "TEST_RUNNER"
        );
        var stock = inventoryService.adjustStock(adj);
        assertEquals(25, stock.getQuantityOnHand());
    }

    @Test
    void testDashboardKpis() {
        DashboardKpiDTO kpi = reportService.getDashboardKpi();
        assertNotNull(kpi);
        assertTrue(kpi.getTotalProducts() > 0);
        assertTrue(kpi.getTotalLocations() > 0);
        assertNotNull(kpi.getTotalCostValuation());
        assertNotNull(kpi.getTotalRetailValuation());
        assertNotNull(kpi.getReorderRecommendations());
    }
}
