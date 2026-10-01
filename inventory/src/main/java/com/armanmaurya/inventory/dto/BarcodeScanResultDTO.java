package com.armanmaurya.inventory.dto;

import com.armanmaurya.inventory.entity.Product;
import java.util.List;

public class BarcodeScanResultDTO {

    private boolean found;
    private String scannedBarcode;
    private Product product;
    private Integer totalStockAcrossLocations;
    private LocationStockSummary currentStoreStock;
    private List<LocationStockSummary> allLocationsStock;
    private boolean lowStockAlert;

    public static class LocationStockSummary {
        private Long locationId;
        private String locationCode;
        private String locationName;
        private String locationType;
        private Integer quantityOnHand;
        private Integer quantityReserved;
        private Integer availableQuantity;
        private String aisleBinLocation;
        private boolean isLowStock;

        public LocationStockSummary() {
        }

        public LocationStockSummary(Long locationId, String locationCode, String locationName, String locationType, Integer quantityOnHand, Integer quantityReserved, Integer availableQuantity, String aisleBinLocation, boolean isLowStock) {
            this.locationId = locationId;
            this.locationCode = locationCode;
            this.locationName = locationName;
            this.locationType = locationType;
            this.quantityOnHand = quantityOnHand;
            this.quantityReserved = quantityReserved;
            this.availableQuantity = availableQuantity;
            this.aisleBinLocation = aisleBinLocation;
            this.isLowStock = isLowStock;
        }

        public Long getLocationId() {
            return locationId;
        }

        public void setLocationId(Long locationId) {
            this.locationId = locationId;
        }

        public String getLocationCode() {
            return locationCode;
        }

        public void setLocationCode(String locationCode) {
            this.locationCode = locationCode;
        }

        public String getLocationName() {
            return locationName;
        }

        public void setLocationName(String locationName) {
            this.locationName = locationName;
        }

        public String getLocationType() {
            return locationType;
        }

        public void setLocationType(String locationType) {
            this.locationType = locationType;
        }

        public Integer getQuantityOnHand() {
            return quantityOnHand;
        }

        public void setQuantityOnHand(Integer quantityOnHand) {
            this.quantityOnHand = quantityOnHand;
        }

        public Integer getQuantityReserved() {
            return quantityReserved;
        }

        public void setQuantityReserved(Integer quantityReserved) {
            this.quantityReserved = quantityReserved;
        }

        public Integer getAvailableQuantity() {
            return availableQuantity;
        }

        public void setAvailableQuantity(Integer availableQuantity) {
            this.availableQuantity = availableQuantity;
        }

        public String getAisleBinLocation() {
            return aisleBinLocation;
        }

        public void setAisleBinLocation(String aisleBinLocation) {
            this.aisleBinLocation = aisleBinLocation;
        }

        public boolean isLowStock() {
            return isLowStock;
        }

        public void setLowStock(boolean lowStock) {
            isLowStock = lowStock;
        }
    }

    public BarcodeScanResultDTO() {
    }

    public boolean isFound() {
        return found;
    }

    public void setFound(boolean found) {
        this.found = found;
    }

    public String getScannedBarcode() {
        return scannedBarcode;
    }

    public void setScannedBarcode(String scannedBarcode) {
        this.scannedBarcode = scannedBarcode;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getTotalStockAcrossLocations() {
        return totalStockAcrossLocations;
    }

    public void setTotalStockAcrossLocations(Integer totalStockAcrossLocations) {
        this.totalStockAcrossLocations = totalStockAcrossLocations;
    }

    public LocationStockSummary getCurrentStoreStock() {
        return currentStoreStock;
    }

    public void setCurrentStoreStock(LocationStockSummary currentStoreStock) {
        this.currentStoreStock = currentStoreStock;
    }

    public List<LocationStockSummary> getAllLocationsStock() {
        return allLocationsStock;
    }

    public void setAllLocationsStock(List<LocationStockSummary> allLocationsStock) {
        this.allLocationsStock = allLocationsStock;
    }

    public boolean isLowStockAlert() {
        return lowStockAlert;
    }

    public void setLowStockAlert(boolean lowStockAlert) {
        this.lowStockAlert = lowStockAlert;
    }
}
