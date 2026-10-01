package com.armanmaurya.inventory.repository;

import com.armanmaurya.inventory.entity.SalesOrder;
import com.armanmaurya.inventory.enums.SalesOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {

    Optional<SalesOrder> findByOrderNumber(String orderNumber);

    List<SalesOrder> findByStatus(SalesOrderStatus status);

    List<SalesOrder> findByLocationId(Long locationId);

    long countByStatus(SalesOrderStatus status);

    boolean existsByOrderNumber(String orderNumber);
}
