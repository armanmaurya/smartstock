package com.armanmaurya.inventory.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;

public class PurchaseOrderReceiveDTO {

    private String receivedBy = "WAREHOUSE_OPERATOR";
    private String notes;

    @NotNull(message = "Items to receive cannot be null")
    private List<ReceiveItem> items;

    public static class ReceiveItem {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull(message = "Quantity received is required")
        @Positive(message = "Quantity received must be positive")
        private Integer quantityReceived;

        public ReceiveItem() {
        }

        public ReceiveItem(Long productId, Integer quantityReceived) {
            this.productId = productId;
            this.quantityReceived = quantityReceived;
        }

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public Integer getQuantityReceived() {
            return quantityReceived;
        }

        public void setQuantityReceived(Integer quantityReceived) {
            this.quantityReceived = quantityReceived;
        }
    }

    public PurchaseOrderReceiveDTO() {
    }

    public String getReceivedBy() {
        return receivedBy;
    }

    public void setReceivedBy(String receivedBy) {
        this.receivedBy = receivedBy;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<ReceiveItem> getItems() {
        return items;
    }

    public void setItems(List<ReceiveItem> items) {
        this.items = items;
    }
}
