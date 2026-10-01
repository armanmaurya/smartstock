package com.armanmaurya.inventory.dto;

import java.math.BigDecimal;

public class ReorderRecommendationDTO {

    private Long productId;
    private String sku;
    private String productName;
    private String category;
    private Long locationId;
    private String locationName;
    private Integer currentStock;
    private Integer reorderPoint;
    private Integer safetyStock;
    private Integer suggestedReorderQuantity;
    private BigDecimal estimatedCost;
    private String urgency; // CRITICAL (out of stock), HIGH (<= safetyStock), MEDIUM (<= reorderPoint)
    private Long supplierId;
    private String supplierName;
    private Integer supplierLeadTimeDays;

    public ReorderRecommendationDTO() {
    }

    public ReorderRecommendationDTO(Long productId, String sku, String productName, String category, Long locationId, String locationName, Integer currentStock, Integer reorderPoint, Integer safetyStock, Integer suggestedReorderQuantity, BigDecimal estimatedCost, String urgency, Long supplierId, String supplierName, Integer supplierLeadTimeDays) {
        this.productId = productId;
        this.sku = sku;
        this.productName = productName;
        this.category = category;
        this.locationId = locationId;
        this.locationName = locationName;
        this.currentStock = currentStock;
        this.reorderPoint = reorderPoint;
        this.safetyStock = safetyStock;
        this.suggestedReorderQuantity = suggestedReorderQuantity;
        this.estimatedCost = estimatedCost;
        this.urgency = urgency;
        this.supplierId = supplierId;
        this.supplierName = supplierName;
        this.supplierLeadTimeDays = supplierLeadTimeDays;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public Integer getCurrentStock() {
        return currentStock;
    }

    public void setCurrentStock(Integer currentStock) {
        this.currentStock = currentStock;
    }

    public Integer getReorderPoint() {
        return reorderPoint;
    }

    public void setReorderPoint(Integer reorderPoint) {
        this.reorderPoint = reorderPoint;
    }

    public Integer getSafetyStock() {
        return safetyStock;
    }

    public void setSafetyStock(Integer safetyStock) {
        this.safetyStock = safetyStock;
    }

    public Integer getSuggestedReorderQuantity() {
        return suggestedReorderQuantity;
    }

    public void setSuggestedReorderQuantity(Integer suggestedReorderQuantity) {
        this.suggestedReorderQuantity = suggestedReorderQuantity;
    }

    public BigDecimal getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(BigDecimal estimatedCost) {
        this.estimatedCost = estimatedCost;
    }

    public String getUrgency() {
        return urgency;
    }

    public void setUrgency(String urgency) {
        this.urgency = urgency;
    }

    public Long getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Long supplierId) {
        this.supplierId = supplierId;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public Integer getSupplierLeadTimeDays() {
        return supplierLeadTimeDays;
    }

    public void setSupplierLeadTimeDays(Integer supplierLeadTimeDays) {
        this.supplierLeadTimeDays = supplierLeadTimeDays;
    }
}
