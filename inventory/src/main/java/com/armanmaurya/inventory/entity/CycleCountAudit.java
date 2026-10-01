package com.armanmaurya.inventory.entity;

import com.armanmaurya.inventory.enums.AuditStatus;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cycle_count_audits", indexes = {
    @Index(name = "idx_audit_number", columnList = "audit_number"),
    @Index(name = "idx_audit_status", columnList = "status")
})
public class CycleCountAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "audit_number", nullable = false, unique = true, length = 64)
    private String auditNumber;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private AuditStatus status;

    @Column(length = 500)
    private String notes;

    @Column(name = "audit_date", nullable = false)
    private LocalDateTime auditDate;

    @Column(name = "reconciled_date")
    private LocalDateTime reconciledDate;

    @OneToMany(mappedBy = "audit", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<CycleCountAuditItem> items = new ArrayList<>();

    public CycleCountAudit() {
    }

    public CycleCountAudit(String auditNumber, Location location, String notes) {
        this.auditNumber = auditNumber;
        this.location = location;
        this.notes = notes;
        this.status = AuditStatus.IN_PROGRESS;
        this.auditDate = LocalDateTime.now();
    }

    public void addItem(CycleCountAuditItem item) {
        items.add(item);
        item.setAudit(this);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAuditNumber() {
        return auditNumber;
    }

    public void setAuditNumber(String auditNumber) {
        this.auditNumber = auditNumber;
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }

    public AuditStatus getStatus() {
        return status;
    }

    public void setStatus(AuditStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getAuditDate() {
        return auditDate;
    }

    public void setAuditDate(LocalDateTime auditDate) {
        this.auditDate = auditDate;
    }

    public LocalDateTime getReconciledDate() {
        return reconciledDate;
    }

    public void setReconciledDate(LocalDateTime reconciledDate) {
        this.reconciledDate = reconciledDate;
    }

    public List<CycleCountAuditItem> getItems() {
        return items;
    }

    public void setItems(List<CycleCountAuditItem> items) {
        this.items = items;
    }
}
