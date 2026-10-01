package com.armanmaurya.inventory.service;

import com.armanmaurya.inventory.dto.*;
import com.armanmaurya.inventory.entity.*;
import com.armanmaurya.inventory.enums.AdjustmentReason;
import com.armanmaurya.inventory.enums.AuditStatus;
import com.armanmaurya.inventory.exception.ResourceNotFoundException;
import com.armanmaurya.inventory.repository.CycleCountAuditRepository;
import com.armanmaurya.inventory.repository.InventoryStockRepository;
import com.armanmaurya.inventory.repository.LocationRepository;
import com.armanmaurya.inventory.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
public class ScannerService {

    private final ProductRepository productRepository;
    private final InventoryStockRepository stockRepository;
    private final LocationRepository locationRepository;
    private final CycleCountAuditRepository auditRepository;
    private final InventoryService inventoryService;

    public ScannerService(ProductRepository productRepository,
                          InventoryStockRepository stockRepository,
                          LocationRepository locationRepository,
                          CycleCountAuditRepository auditRepository,
                          InventoryService inventoryService) {
        this.productRepository = productRepository;
        this.stockRepository = stockRepository;
        this.locationRepository = locationRepository;
        this.auditRepository = auditRepository;
        this.inventoryService = inventoryService;
    }

    @Transactional(readOnly = true)
    public BarcodeScanResultDTO scanBarcode(String barcode, Long locationId) {
        BarcodeScanResultDTO result = new BarcodeScanResultDTO();
        result.setScannedBarcode(barcode);

        Optional<Product> productOpt = productRepository.findByBarcode(barcode);
        if (productOpt.isEmpty()) {
            // Also attempt SKU lookup fallback if barcode didn't match directly
            productOpt = productRepository.findBySku(barcode);
        }

        if (productOpt.isEmpty()) {
            result.setFound(false);
            return result;
        }

        Product product = productOpt.get();
        result.setFound(true);
        result.setProduct(product);

        List<InventoryStock> allStocks = stockRepository.findByProductId(product.getId());

        int totalStock = allStocks.stream().mapToInt(InventoryStock::getQuantityOnHand).sum();
        result.setTotalStockAcrossLocations(totalStock);

        List<BarcodeScanResultDTO.LocationStockSummary> summaries = allStocks.stream().map(s ->
                new BarcodeScanResultDTO.LocationStockSummary(
                        s.getLocation().getId(),
                        s.getLocation().getCode(),
                        s.getLocation().getName(),
                        s.getLocation().getType().name(),
                        s.getQuantityOnHand(),
                        s.getQuantityReserved(),
                        s.getAvailableQuantity(),
                        s.getAisleBinLocation(),
                        s.isLowStock()
                )
        ).collect(Collectors.toList());

        result.setAllLocationsStock(summaries);

        if (locationId != null) {
            summaries.stream()
                    .filter(s -> s.getLocationId().equals(locationId))
                    .findFirst()
                    .ifPresent(curr -> {
                        result.setCurrentStoreStock(curr);
                        result.setLowStockAlert(curr.isLowStock());
                    });
        }

        return result;
    }

    public RfidScanResultDTO scanRfidBatch(RfidScanRequestDTO dto) {
        Location location = locationRepository.findById(dto.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + dto.getLocationId()));

        RfidScanResultDTO response = new RfidScanResultDTO();
        response.setLocationId(location.getId());
        response.setLocationName(location.getName());
        response.setTotalTagsScanned(dto.getRfidTags().size());

        // Count occurrences of each RFID tag
        Map<String, Long> tagCounts = dto.getRfidTags().stream()
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));

        List<Product> matchedProducts = productRepository.findByRfidTagIn(tagCounts.keySet());
        Map<String, Product> productByTag = matchedProducts.stream()
                .collect(Collectors.toMap(Product::getRfidTag, Function.identity()));

        List<String> unknown = new ArrayList<>();
        List<RfidScanResultDTO.RfidProductGroup> identified = new ArrayList<>();

        for (Map.Entry<String, Long> entry : tagCounts.entrySet()) {
            String tag = entry.getKey();
            int count = entry.getValue().intValue();

            if (productByTag.containsKey(tag)) {
                Product product = productByTag.get(tag);
                InventoryStock stock = inventoryService.getOrCreateStock(product.getId(), location.getId());

                identified.add(new RfidScanResultDTO.RfidProductGroup(
                        product,
                        count,
                        stock.getQuantityOnHand(),
                        stock.getAisleBinLocation()
                ));
            } else {
                unknown.add(tag);
            }
        }

        response.setRecognizedTagsCount(identified.size());
        response.setUnknownTagsCount(unknown.size());
        response.setUnknownTags(unknown);
        response.setIdentifiedProducts(identified);

        return response;
    }

    public CycleCountAudit performCycleCountAudit(CycleCountRequestDTO dto, boolean autoReconcile) {
        Location location = locationRepository.findById(dto.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + dto.getLocationId()));

        String auditNumber = "AUD-" + System.currentTimeMillis();
        CycleCountAudit audit = new CycleCountAudit(auditNumber, location, dto.getNotes());

        for (CycleCountRequestDTO.CountItem itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemDto.getProductId()));

            InventoryStock stock = inventoryService.getOrCreateStock(product.getId(), location.getId());
            int sysQty = stock.getQuantityOnHand();
            int countedQty = itemDto.getCountedQuantity();

            CycleCountAuditItem auditItem = new CycleCountAuditItem(product, sysQty, countedQty);
            audit.addItem(auditItem);

            if (autoReconcile && sysQty != countedQty) {
                int delta = countedQty - sysQty;
                StockAdjustmentDTO adj = new StockAdjustmentDTO(
                        product.getId(),
                        location.getId(),
                        delta,
                        AdjustmentReason.CYCLE_COUNT_VARIANCE,
                        "Cycle count reconciliation audit: " + auditNumber,
                        "AUDIT_SYSTEM"
                );
                inventoryService.adjustStock(adj);
            }
        }

        audit.setStatus(autoReconcile ? AuditStatus.RECONCILED : AuditStatus.COMPLETED);
        if (autoReconcile) {
            audit.setReconciledDate(LocalDateTime.now());
        }

        return auditRepository.save(audit);
    }

    @Transactional(readOnly = true)
    public List<CycleCountAudit> getAllAudits() {
        return auditRepository.findAll();
    }
}
