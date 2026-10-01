package com.armanmaurya.inventory.dto;

import com.armanmaurya.inventory.entity.Product;
import java.util.ArrayList;
import java.util.List;

public class RfidScanResultDTO {

    private Long locationId;
    private String locationName;
    private int totalTagsScanned;
    private int recognizedTagsCount;
    private int unknownTagsCount;
    private List<String> unknownTags = new ArrayList<>();
    private List<RfidProductGroup> identifiedProducts = new ArrayList<>();

    public static class RfidProductGroup {
        private Product product;
        private int scannedCount;
        private int systemOnHand;
        private int variance; // scannedCount - systemOnHand
        private String aisleBinLocation;

        public RfidProductGroup() {
        }

        public RfidProductGroup(Product product, int scannedCount, int systemOnHand, String aisleBinLocation) {
            this.product = product;
            this.scannedCount = scannedCount;
            this.systemOnHand = systemOnHand;
            this.variance = scannedCount - systemOnHand;
            this.aisleBinLocation = aisleBinLocation;
        }

        public Product getProduct() {
            return product;
        }

        public void setProduct(Product product) {
            this.product = product;
        }

        public int getScannedCount() {
            return scannedCount;
        }

        public void setScannedCount(int scannedCount) {
            this.scannedCount = scannedCount;
        }

        public int getSystemOnHand() {
            return systemOnHand;
        }

        public void setSystemOnHand(int systemOnHand) {
            this.systemOnHand = systemOnHand;
        }

        public int getVariance() {
            return variance;
        }

        public void setVariance(int variance) {
            this.variance = variance;
        }

        public String getAisleBinLocation() {
            return aisleBinLocation;
        }

        public void setAisleBinLocation(String aisleBinLocation) {
            this.aisleBinLocation = aisleBinLocation;
        }
    }

    public RfidScanResultDTO() {
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

    public int getTotalTagsScanned() {
        return totalTagsScanned;
    }

    public void setTotalTagsScanned(int totalTagsScanned) {
        this.totalTagsScanned = totalTagsScanned;
    }

    public int getRecognizedTagsCount() {
        return recognizedTagsCount;
    }

    public void setRecognizedTagsCount(int recognizedTagsCount) {
        this.recognizedTagsCount = recognizedTagsCount;
    }

    public int getUnknownTagsCount() {
        return unknownTagsCount;
    }

    public void setUnknownTagsCount(int unknownTagsCount) {
        this.unknownTagsCount = unknownTagsCount;
    }

    public List<String> getUnknownTags() {
        return unknownTags;
    }

    public void setUnknownTags(List<String> unknownTags) {
        this.unknownTags = unknownTags;
    }

    public List<RfidProductGroup> getIdentifiedProducts() {
        return identifiedProducts;
    }

    public void setIdentifiedProducts(List<RfidProductGroup> identifiedProducts) {
        this.identifiedProducts = identifiedProducts;
    }
}
