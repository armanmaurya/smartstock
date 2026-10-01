package com.armanmaurya.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class SalesOrderRequestDTO {

    @NotNull(message = "Location ID is required")
    private Long locationId;

    @NotBlank(message = "Customer name is required")
    private String customerName;

    private String customerEmail;

    @NotEmpty(message = "Sales order must contain at least one item")
    @Valid
    private List<SalesOrderItemDTO> items;

    public SalesOrderRequestDTO() {
    }

    public SalesOrderRequestDTO(Long locationId, String customerName, String customerEmail, List<SalesOrderItemDTO> items) {
        this.locationId = locationId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.items = items;
    }

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public List<SalesOrderItemDTO> getItems() {
        return items;
    }

    public void setItems(List<SalesOrderItemDTO> items) {
        this.items = items;
    }
}
