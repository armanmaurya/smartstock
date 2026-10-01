package com.armanmaurya.inventory.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class CycleCountRequestDTO {

    @NotNull(message = "Location ID is required")
    private Long locationId;

    private String notes;

    @NotEmpty(message = "Counted items cannot be empty")
    private List<CountItem> items;

    public static class CountItem {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull(message = "Counted quantity is required")
        private Integer countedQuantity;

        public CountItem() {
        }

        public CountItem(Long productId, Integer countedQuantity) {
            this.productId = productId;
            this.countedQuantity = countedQuantity;
        }

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public Integer getCountedQuantity() {
            return countedQuantity;
        }

        public void setCountedQuantity(Integer countedQuantity) {
            this.countedQuantity = countedQuantity;
        }
    }

    public CycleCountRequestDTO() {
    }

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<CountItem> getItems() {
        return items;
    }

    public void setItems(List<CountItem> items) {
        this.items = items;
    }
}
