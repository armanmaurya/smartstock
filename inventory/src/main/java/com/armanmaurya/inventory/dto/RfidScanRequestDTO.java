package com.armanmaurya.inventory.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class RfidScanRequestDTO {

    @NotNull(message = "Location ID is required")
    private Long locationId;

    @NotEmpty(message = "RFID tag list cannot be empty")
    private List<String> rfidTags;

    private String operator = "RFID_HANDHELD_READER";

    public RfidScanRequestDTO() {
    }

    public RfidScanRequestDTO(Long locationId, List<String> rfidTags, String operator) {
        this.locationId = locationId;
        this.rfidTags = rfidTags;
        this.operator = operator;
    }

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }

    public List<String> getRfidTags() {
        return rfidTags;
    }

    public void setRfidTags(List<String> rfidTags) {
        this.rfidTags = rfidTags;
    }

    public String getOperator() {
        return operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }
}
