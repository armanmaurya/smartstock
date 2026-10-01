package com.armanmaurya.inventory.dto;

import com.armanmaurya.inventory.entity.InventoryStock;
import com.armanmaurya.inventory.entity.StockMovement;

import java.math.BigDecimal;
import java.util.List;

public class DashboardKpiDTO {

    private long totalProducts;
    private long totalLocations;
    private long totalStockUnits;
    private long lowStockCount;
    private long outOfStockCount;
    private BigDecimal totalCostValuation;
    private BigDecimal totalRetailValuation;
    private BigDecimal potentialGrossMargin;
    private Double marginPercentage;
    private long pendingPurchaseOrders;
    private long pendingSalesOrders;
    private List<InventoryStock> lowStockAlerts;
    private List<ReorderRecommendationDTO> reorderRecommendations;
    private List<StockMovement> recentMovements;

    public DashboardKpiDTO() {
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getTotalLocations() {
        return totalLocations;
    }

    public void setTotalLocations(long totalLocations) {
        this.totalLocations = totalLocations;
    }

    public long getTotalStockUnits() {
        return totalStockUnits;
    }

    public void setTotalStockUnits(long totalStockUnits) {
        this.totalStockUnits = totalStockUnits;
    }

    public long getLowStockCount() {
        return lowStockCount;
    }

    public void setLowStockCount(long lowStockCount) {
        this.lowStockCount = lowStockCount;
    }

    public long getOutOfStockCount() {
        return outOfStockCount;
    }

    public void setOutOfStockCount(long outOfStockCount) {
        this.outOfStockCount = outOfStockCount;
    }

    public BigDecimal getTotalCostValuation() {
        return totalCostValuation;
    }

    public void setTotalCostValuation(BigDecimal totalCostValuation) {
        this.totalCostValuation = totalCostValuation;
    }

    public BigDecimal getTotalRetailValuation() {
        return totalRetailValuation;
    }

    public void setTotalRetailValuation(BigDecimal totalRetailValuation) {
        this.totalRetailValuation = totalRetailValuation;
    }

    public BigDecimal getPotentialGrossMargin() {
        return potentialGrossMargin;
    }

    public void setPotentialGrossMargin(BigDecimal potentialGrossMargin) {
        this.potentialGrossMargin = potentialGrossMargin;
    }

    public Double getMarginPercentage() {
        return marginPercentage;
    }

    public void setMarginPercentage(Double marginPercentage) {
        this.marginPercentage = marginPercentage;
    }

    public long getPendingPurchaseOrders() {
        return pendingPurchaseOrders;
    }

    public void setPendingPurchaseOrders(long pendingPurchaseOrders) {
        this.pendingPurchaseOrders = pendingPurchaseOrders;
    }

    public long getPendingSalesOrders() {
        return pendingSalesOrders;
    }

    public void setPendingSalesOrders(long pendingSalesOrders) {
        this.pendingSalesOrders = pendingSalesOrders;
    }

    public List<InventoryStock> getLowStockAlerts() {
        return lowStockAlerts;
    }

    public void setLowStockAlerts(List<InventoryStock> lowStockAlerts) {
        this.lowStockAlerts = lowStockAlerts;
    }

    public List<ReorderRecommendationDTO> getReorderRecommendations() {
        return reorderRecommendations;
    }

    public void setReorderRecommendations(List<ReorderRecommendationDTO> reorderRecommendations) {
        this.reorderRecommendations = reorderRecommendations;
    }

    public List<StockMovement> getRecentMovements() {
        return recentMovements;
    }

    public void setRecentMovements(List<StockMovement> recentMovements) {
        this.recentMovements = recentMovements;
    }
}
