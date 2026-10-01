package com.armanmaurya.inventory.dto;

import com.armanmaurya.inventory.enums.AdjustmentReason;
import jakarta.validation.constraints.NotNull;

public class StockAdjustmentDTO {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Location ID is required")
    private Long locationId;

    @NotNull(message = "Quantity delta is required (can be positive or negative)")
    private Integer quantityDelta;

    @NotNull(message = "Adjustment reason is required")
    private AdjustmentReason adjustmentReason;

    private String notes;
    private String performedBy = "SYSTEM";

    public StockAdjustmentDTO() {
    }

    public StockAdjustmentDTO(Long productId, Long locationId, Integer quantityDelta, AdjustmentReason adjustmentReason, String notes, String performedBy) {
        this.productId = productId;
        this.locationId = locationId;
        this.quantityDelta = quantityDelta;
        this.adjustmentReason = adjustmentReason;
        this.notes = notes;
        this.performedBy = performedBy;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }

    public Integer getQuantityDelta() {
        return quantityDelta;
    }

    public void setQuantityDelta(Integer quantityDelta) {
        this.quantityDelta = quantityDelta;
    }

    public AdjustmentReason getAdjustmentReason() {
        return adjustmentReason;
    }

    public void setAdjustmentReason(AdjustmentReason adjustmentReason) {
        this.adjustmentReason = adjustmentReason;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }
}
