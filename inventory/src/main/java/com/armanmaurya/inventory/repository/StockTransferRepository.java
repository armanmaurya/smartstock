package com.armanmaurya.inventory.repository;

import com.armanmaurya.inventory.entity.StockTransfer;
import com.armanmaurya.inventory.enums.TransferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockTransferRepository extends JpaRepository<StockTransfer, Long> {

    Optional<StockTransfer> findByTransferNumber(String transferNumber);

    List<StockTransfer> findByStatus(TransferStatus status);

    List<StockTransfer> findByFromLocationIdOrToLocationId(Long fromLocationId, Long toLocationId);

    boolean existsByTransferNumber(String transferNumber);
}
