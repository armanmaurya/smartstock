package com.armanmaurya.inventory.repository;

import com.armanmaurya.inventory.entity.PurchaseOrder;
import com.armanmaurya.inventory.enums.PurchaseOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    Optional<PurchaseOrder> findByPoNumber(String poNumber);

    List<PurchaseOrder> findByStatus(PurchaseOrderStatus status);

    List<PurchaseOrder> findBySupplierId(Long supplierId);

    long countByStatus(PurchaseOrderStatus status);

    boolean existsByPoNumber(String poNumber);
}
