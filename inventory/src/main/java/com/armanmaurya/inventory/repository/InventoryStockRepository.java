package com.armanmaurya.inventory.repository;

import com.armanmaurya.inventory.entity.InventoryStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryStockRepository extends JpaRepository<InventoryStock, Long> {

    Optional<InventoryStock> findByProductIdAndLocationId(Long productId, Long locationId);

    List<InventoryStock> findByProductId(Long productId);

    List<InventoryStock> findByLocationId(Long locationId);

    @Query("SELECT s FROM InventoryStock s WHERE s.quantityOnHand <= s.reorderPoint")
    List<InventoryStock> findAllLowStock();

    @Query("SELECT s FROM InventoryStock s WHERE s.location.id = :locationId AND s.quantityOnHand <= s.reorderPoint")
    List<InventoryStock> findLowStockByLocation(@Param("locationId") Long locationId);

    @Query("SELECT s FROM InventoryStock s WHERE s.quantityOnHand <= 0")
    List<InventoryStock> findAllOutOfStock();

    @Query("SELECT s FROM InventoryStock s WHERE s.location.id = :locationId AND s.quantityOnHand <= 0")
    List<InventoryStock> findOutOfStockByLocation(@Param("locationId") Long locationId);

    @Query("SELECT COALESCE(SUM(s.quantityOnHand * s.product.costPrice), 0) FROM InventoryStock s")
    BigDecimal calculateTotalCostValuation();

    @Query("SELECT COALESCE(SUM(s.quantityOnHand * s.product.sellingPrice), 0) FROM InventoryStock s")
    BigDecimal calculateTotalRetailValuation();

    @Query("SELECT COALESCE(SUM(s.quantityOnHand * s.product.costPrice), 0) FROM InventoryStock s WHERE s.location.id = :locationId")
    BigDecimal calculateCostValuationByLocation(@Param("locationId") Long locationId);

    @Query("SELECT COALESCE(SUM(s.quantityOnHand * s.product.sellingPrice), 0) FROM InventoryStock s WHERE s.location.id = :locationId")
    BigDecimal calculateRetailValuationByLocation(@Param("locationId") Long locationId);

    @Query("SELECT COALESCE(SUM(s.quantityOnHand), 0) FROM InventoryStock s WHERE s.product.id = :productId")
    Integer getTotalStockForProduct(@Param("productId") Long productId);
}
