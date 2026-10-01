package com.armanmaurya.inventory.service;

import com.armanmaurya.inventory.dto.DashboardKpiDTO;
import com.armanmaurya.inventory.dto.ReorderRecommendationDTO;
import com.armanmaurya.inventory.entity.InventoryStock;
import com.armanmaurya.inventory.entity.Product;
import com.armanmaurya.inventory.entity.Supplier;
import com.armanmaurya.inventory.enums.PurchaseOrderStatus;
import com.armanmaurya.inventory.enums.SalesOrderStatus;
import com.armanmaurya.inventory.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ReportService {

    private final ProductRepository productRepository;
    private final LocationRepository locationRepository;
    private final InventoryStockRepository stockRepository;
    private final StockMovementRepository movementRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final SupplierRepository supplierRepository;

    public ReportService(ProductRepository productRepository,
                         LocationRepository locationRepository,
                         InventoryStockRepository stockRepository,
                         StockMovementRepository movementRepository,
                         PurchaseOrderRepository purchaseOrderRepository,
                         SalesOrderRepository salesOrderRepository,
                         SupplierRepository supplierRepository) {
        this.productRepository = productRepository;
        this.locationRepository = locationRepository;
        this.stockRepository = stockRepository;
        this.movementRepository = movementRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.salesOrderRepository = salesOrderRepository;
        this.supplierRepository = supplierRepository;
    }

    public DashboardKpiDTO getDashboardKpi() {
        DashboardKpiDTO kpi = new DashboardKpiDTO();

        long totalProducts = productRepository.count();
        long totalLocations = locationRepository.count();

        List<InventoryStock> allStocks = stockRepository.findAll();
        long totalStockUnits = allStocks.stream().mapToLong(InventoryStock::getQuantityOnHand).sum();

        List<InventoryStock> lowStockList = stockRepository.findAllLowStock();
        List<InventoryStock> outOfStockList = stockRepository.findAllOutOfStock();

        BigDecimal totalCostVal = stockRepository.calculateTotalCostValuation();
        BigDecimal totalRetailVal = stockRepository.calculateTotalRetailValuation();

        if (totalCostVal == null) totalCostVal = BigDecimal.ZERO;
        if (totalRetailVal == null) totalRetailVal = BigDecimal.ZERO;

        BigDecimal grossMargin = totalRetailVal.subtract(totalCostVal);
        Double marginPct = 0.0;
        if (totalRetailVal.compareTo(BigDecimal.ZERO) > 0) {
            marginPct = grossMargin.divide(totalRetailVal, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
        }

        long pendingPos = purchaseOrderRepository.countByStatus(PurchaseOrderStatus.ISSUED)
                + purchaseOrderRepository.countByStatus(PurchaseOrderStatus.PARTIALLY_RECEIVED);

        long pendingSos = salesOrderRepository.countByStatus(SalesOrderStatus.CONFIRMED)
                + salesOrderRepository.countByStatus(SalesOrderStatus.PACKED);

        kpi.setTotalProducts(totalProducts);
        kpi.setTotalLocations(totalLocations);
        kpi.setTotalStockUnits(totalStockUnits);
        kpi.setLowStockCount(lowStockList.size());
        kpi.setOutOfStockCount(outOfStockList.size());
        kpi.setTotalCostValuation(totalCostVal);
        kpi.setTotalRetailValuation(totalRetailVal);
        kpi.setPotentialGrossMargin(grossMargin);
        kpi.setMarginPercentage(marginPct);
        kpi.setPendingPurchaseOrders(pendingPos);
        kpi.setPendingSalesOrders(pendingSos);
        kpi.setLowStockAlerts(lowStockList);
        kpi.setRecentMovements(movementRepository.findTop50ByOrderByMovementDateDesc());
        kpi.setReorderRecommendations(getReorderRecommendations());

        return kpi;
    }

    public List<ReorderRecommendationDTO> getReorderRecommendations() {
        List<InventoryStock> lowStocks = stockRepository.findAllLowStock();
        List<Supplier> activeSuppliers = supplierRepository.findByActiveTrue();
        Supplier defaultSupplier = activeSuppliers.isEmpty() ? null : activeSuppliers.get(0);

        List<ReorderRecommendationDTO> recommendations = new ArrayList<>();

        for (InventoryStock stock : lowStocks) {
            Product prod = stock.getProduct();
            int current = stock.getQuantityOnHand();
            int reorderPt = stock.getReorderPoint();
            int safety = stock.getSafetyStock();
            int capacity = stock.getMaxCapacity() != null ? stock.getMaxCapacity() : reorderPt * 3;

            int suggestedQty = Math.max(reorderPt * 2, capacity - current);
            BigDecimal estimatedCost = prod.getCostPrice().multiply(BigDecimal.valueOf(suggestedQty));

            String urgency;
            if (current <= 0) {
                urgency = "CRITICAL";
            } else if (current <= safety) {
                urgency = "HIGH";
            } else {
                urgency = "MEDIUM";
            }

            Long supId = defaultSupplier != null ? defaultSupplier.getId() : null;
            String supName = defaultSupplier != null ? defaultSupplier.getName() : "Primary Distributor";
            Integer supLead = defaultSupplier != null ? defaultSupplier.getLeadTimeDays() : 7;

            recommendations.add(new ReorderRecommendationDTO(
                    prod.getId(),
                    prod.getSku(),
                    prod.getName(),
                    prod.getCategory(),
                    stock.getLocation().getId(),
                    stock.getLocation().getName(),
                    current,
                    reorderPt,
                    safety,
                    suggestedQty,
                    estimatedCost,
                    urgency,
                    supId,
                    supName,
                    supLead
            ));
        }

        return recommendations;
    }
}
