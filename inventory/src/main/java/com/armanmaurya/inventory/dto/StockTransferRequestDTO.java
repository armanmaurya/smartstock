package com.armanmaurya.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class StockTransferRequestDTO {

    @NotNull(message = "Source location ID is required")
    private Long fromLocationId;

    @NotNull(message = "Destination location ID is required")
    private Long toLocationId;

    private String notes;

    @NotEmpty(message = "At least one item must be included in the transfer")
    @Valid
    private List<TransferItemDTO> items;

    public StockTransferRequestDTO() {
    }

    public StockTransferRequestDTO(Long fromLocationId, Long toLocationId, String notes, List<TransferItemDTO> items) {
        this.fromLocationId = fromLocationId;
        this.toLocationId = toLocationId;
        this.notes = notes;
        this.items = items;
    }

    public Long getFromLocationId() {
        return fromLocationId;
    }

    public void setFromLocationId(Long fromLocationId) {
        this.fromLocationId = fromLocationId;
    }

    public Long getToLocationId() {
        return toLocationId;
    }

    public void setToLocationId(Long toLocationId) {
        this.toLocationId = toLocationId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<TransferItemDTO> getItems() {
        return items;
    }

    public void setItems(List<TransferItemDTO> items) {
        this.items = items;
    }
}
