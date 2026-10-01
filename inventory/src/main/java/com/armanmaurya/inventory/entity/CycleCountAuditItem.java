package com.armanmaurya.inventory.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "cycle_count_audit_items")
public class CycleCountAuditItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_id", nullable = false)
    @JsonBackReference
    private CycleCountAudit audit;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "system_quantity", nullable = false)
    private Integer systemQuantity;

    @Column(name = "counted_quantity", nullable = false)
    private Integer countedQuantity;

    @Column(nullable = false)
    private Integer variance;

    public CycleCountAuditItem() {
    }

    public CycleCountAuditItem(Product product, Integer systemQuantity, Integer countedQuantity) {
        this.product = product;
        this.systemQuantity = systemQuantity;
        this.countedQuantity = countedQuantity;
        this.variance = (countedQuantity != null ? countedQuantity : 0) - (systemQuantity != null ? systemQuantity : 0);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CycleCountAudit getAudit() {
        return audit;
    }

    public void setAudit(CycleCountAudit audit) {
        this.audit = audit;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getSystemQuantity() {
        return systemQuantity;
    }

    public void setSystemQuantity(Integer systemQuantity) {
        this.systemQuantity = systemQuantity;
        recalculateVariance();
    }

    public Integer getCountedQuantity() {
        return countedQuantity;
    }

    public void setCountedQuantity(Integer countedQuantity) {
        this.countedQuantity = countedQuantity;
        recalculateVariance();
    }

    public Integer getVariance() {
        return variance;
    }

    public void setVariance(Integer variance) {
        this.variance = variance;
    }

    private void recalculateVariance() {
        int sys = this.systemQuantity != null ? this.systemQuantity : 0;
        int counted = this.countedQuantity != null ? this.countedQuantity : 0;
        this.variance = counted - sys;
    }
}
