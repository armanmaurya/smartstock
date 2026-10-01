package com.armanmaurya.inventory.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_stocks", uniqueConstraints = {
    @UniqueConstraint(name = "uk_product_location", columnNames = {"product_id", "location_id"})
}, indexes = {
    @Index(name = "idx_stock_product", columnList = "product_id"),
    @Index(name = "idx_stock_location", columnList = "location_id")
})
public class InventoryStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(name = "quantity_on_hand", nullable = false)
    private Integer quantityOnHand = 0;

    @Column(name = "quantity_reserved", nullable = false)
    private Integer quantityReserved = 0;

    @Column(name = "reorder_point", nullable = false)
    private Integer reorderPoint = 10;

    @Column(name = "safety_stock", nullable = false)
    private Integer safetyStock = 5;

    @Column(name = "max_capacity")
    private Integer maxCapacity = 500;

    @Column(name = "aisle_bin_location", length = 100)
    private String aisleBinLocation;

    @Column(name = "last_restocked_at")
    private LocalDateTime lastRestockedAt;

    public InventoryStock() {
    }

    public InventoryStock(Product product, Location location, Integer quantityOnHand, Integer reorderPoint, Integer safetyStock, String aisleBinLocation) {
        this.product = product;
        this.location = location;
        this.quantityOnHand = quantityOnHand != null ? quantityOnHand : 0;
        this.quantityReserved = 0;
        this.reorderPoint = reorderPoint != null ? reorderPoint : 10;
        this.safetyStock = safetyStock != null ? safetyStock : 5;
        this.aisleBinLocation = aisleBinLocation;
        this.lastRestockedAt = LocalDateTime.now();
    }

    public Integer getAvailableQuantity() {
        return Math.max(0, (quantityOnHand != null ? quantityOnHand : 0) - (quantityReserved != null ? quantityReserved : 0));
    }

    public boolean isLowStock() {
        return quantityOnHand != null && quantityOnHand <= reorderPoint;
    }

    public boolean isOutOfStock() {
        return quantityOnHand == null || quantityOnHand <= 0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
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

    public Integer getMaxCapacity() {
        return maxCapacity;
    }

    public void setMaxCapacity(Integer maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    public String getAisleBinLocation() {
        return aisleBinLocation;
    }

    public void setAisleBinLocation(String aisleBinLocation) {
        this.aisleBinLocation = aisleBinLocation;
    }

    public LocalDateTime getLastRestockedAt() {
        return lastRestockedAt;
    }

    public void setLastRestockedAt(LocalDateTime lastRestockedAt) {
        this.lastRestockedAt = lastRestockedAt;
    }
}
