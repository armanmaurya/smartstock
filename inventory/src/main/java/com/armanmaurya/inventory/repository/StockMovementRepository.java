package com.armanmaurya.inventory.repository;

import com.armanmaurya.inventory.entity.StockMovement;
import com.armanmaurya.inventory.enums.MovementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findByProductIdOrderByMovementDateDesc(Long productId);

    List<StockMovement> findByMovementDateBetweenOrderByMovementDateDesc(LocalDateTime start, LocalDateTime end);

    List<StockMovement> findTop50ByOrderByMovementDateDesc();

    List<StockMovement> findByMovementTypeOrderByMovementDateDesc(MovementType movementType);

    List<StockMovement> findByFromLocationIdOrToLocationIdOrderByMovementDateDesc(Long fromLocationId, Long toLocationId);
}
