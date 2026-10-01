package com.armanmaurya.inventory.service;

import com.armanmaurya.inventory.dto.StockAdjustmentDTO;
import com.armanmaurya.inventory.dto.StockTransferRequestDTO;
import com.armanmaurya.inventory.dto.TransferItemDTO;
import com.armanmaurya.inventory.entity.*;
import com.armanmaurya.inventory.enums.MovementType;
import com.armanmaurya.inventory.enums.TransferStatus;
import com.armanmaurya.inventory.exception.BusinessException;
import com.armanmaurya.inventory.exception.InsufficientStockException;
import com.armanmaurya.inventory.exception.ResourceNotFoundException;
import com.armanmaurya.inventory.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class InventoryService {

    private final InventoryStockRepository stockRepository;
    private final StockMovementRepository movementRepository;
    private final StockTransferRepository transferRepository;
    private final ProductRepository productRepository;
    private final LocationRepository locationRepository;

    public InventoryService(InventoryStockRepository stockRepository,
                            StockMovementRepository movementRepository,
                            StockTransferRepository transferRepository,
                            ProductRepository productRepository,
                            LocationRepository locationRepository) {
        this.stockRepository = stockRepository;
        this.movementRepository = movementRepository;
        this.transferRepository = transferRepository;
        this.productRepository = productRepository;
        this.locationRepository = locationRepository;
    }

    @Transactional(readOnly = true)
    public List<InventoryStock> getAllStocks() {
        return stockRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<InventoryStock> getStocksByLocation(Long locationId) {
        return stockRepository.findByLocationId(locationId);
    }

    @Transactional(readOnly = true)
    public List<InventoryStock> getStocksByProduct(Long productId) {
        return stockRepository.findByProductId(productId);
    }

    @Transactional(readOnly = true)
    public InventoryStock getStock(Long productId, Long locationId) {
        return stockRepository.findByProductIdAndLocationId(productId, locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock record not found for product ID " + productId + " at location ID " + locationId));
    }

    public InventoryStock getOrCreateStock(Long productId, Long locationId) {
        return stockRepository.findByProductIdAndLocationId(productId, locationId)
                .orElseGet(() -> {
                    Product product = productRepository.findById(productId)
                            .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));
                    Location location = locationRepository.findById(locationId)
                            .orElseThrow(() -> new ResourceNotFoundException("Location not found: " + locationId));
                    InventoryStock newStock = new InventoryStock(product, location, 0, 10, 5, "Unassigned");
                    return stockRepository.save(newStock);
                });
    }

    @Transactional(readOnly = true)
    public List<InventoryStock> getLowStockAlerts(Long locationId) {
        if (locationId != null) {
            return stockRepository.findLowStockByLocation(locationId);
        }
        return stockRepository.findAllLowStock();
    }

    @Transactional(readOnly = true)
    public List<InventoryStock> getOutOfStockAlerts(Long locationId) {
        if (locationId != null) {
            return stockRepository.findOutOfStockByLocation(locationId);
        }
        return stockRepository.findAllOutOfStock();
    }

    public InventoryStock adjustStock(StockAdjustmentDTO dto) {
        InventoryStock stock = getOrCreateStock(dto.getProductId(), dto.getLocationId());
        int currentQty = stock.getQuantityOnHand();
        int newQty = currentQty + dto.getQuantityDelta();

        if (newQty < 0) {
            throw new InsufficientStockException("Cannot adjust stock below zero. Current: " + currentQty + ", Adjustment delta: " + dto.getQuantityDelta());
        }

        stock.setQuantityOnHand(newQty);
        stock.setLastRestockedAt(LocalDateTime.now());
        InventoryStock savedStock = stockRepository.save(stock);

        // Record movement audit
        MovementType movType = dto.getQuantityDelta() >= 0 ? MovementType.ADJUSTMENT : MovementType.ADJUSTMENT;
        String reason = dto.getAdjustmentReason() + (dto.getNotes() != null ? " - " + dto.getNotes() : "");
        StockMovement movement = new StockMovement(
                stock.getProduct(),
                dto.getQuantityDelta() < 0 ? stock.getLocation() : null,
                dto.getQuantityDelta() > 0 ? stock.getLocation() : null,
                Math.abs(dto.getQuantityDelta()),
                movType,
                "ADJ-" + System.currentTimeMillis(),
                reason,
                dto.getPerformedBy()
        );
        movementRepository.save(movement);

        return savedStock;
    }

    public StockTransfer createStockTransfer(StockTransferRequestDTO dto) {
        if (dto.getFromLocationId().equals(dto.getToLocationId())) {
            throw new BusinessException("Source and destination locations cannot be the same.");
        }

        Location fromLocation = locationRepository.findById(dto.getFromLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Source location not found: " + dto.getFromLocationId()));
        Location toLocation = locationRepository.findById(dto.getToLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination location not found: " + dto.getToLocationId()));

        String transferNumber = "TRF-" + System.currentTimeMillis();
        StockTransfer transfer = new StockTransfer(transferNumber, fromLocation, toLocation, dto.getNotes());

        for (TransferItemDTO itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemDto.getProductId()));

            // Verify stock availability at source location
            InventoryStock stock = getOrCreateStock(product.getId(), fromLocation.getId());
            if (stock.getAvailableQuantity() < itemDto.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for product " + product.getSku() +
                        " at source location. Available: " + stock.getAvailableQuantity() + ", Requested: " + itemDto.getQuantity());
            }

            // Reserve the stock
            stock.setQuantityReserved(stock.getQuantityReserved() + itemDto.getQuantity());
            stockRepository.save(stock);

            StockTransferItem item = new StockTransferItem(product, itemDto.getQuantity());
            transfer.addItem(item);
        }

        return transferRepository.save(transfer);
    }

    public StockTransfer approveTransfer(Long transferId) {
        StockTransfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock transfer not found: " + transferId));

        if (transfer.getStatus() != TransferStatus.REQUESTED) {
            throw new BusinessException("Transfer cannot be approved. Current status: " + transfer.getStatus());
        }

        transfer.setStatus(TransferStatus.APPROVED);
        return transferRepository.save(transfer);
    }

    public StockTransfer shipTransfer(Long transferId) {
        StockTransfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock transfer not found: " + transferId));

        if (transfer.getStatus() != TransferStatus.APPROVED && transfer.getStatus() != TransferStatus.REQUESTED) {
            throw new BusinessException("Transfer cannot be shipped. Current status: " + transfer.getStatus());
        }

        // Deduct from source location & release reserved
        for (StockTransferItem item : transfer.getItems()) {
            InventoryStock sourceStock = getOrCreateStock(item.getProduct().getId(), transfer.getFromLocation().getId());
            sourceStock.setQuantityOnHand(sourceStock.getQuantityOnHand() - item.getQuantityRequested());
            sourceStock.setQuantityReserved(Math.max(0, sourceStock.getQuantityReserved() - item.getQuantityRequested()));
            stockRepository.save(sourceStock);

            item.setQuantityShipped(item.getQuantityRequested());

            StockMovement movement = new StockMovement(
                    item.getProduct(),
                    transfer.getFromLocation(),
                    null,
                    item.getQuantityRequested(),
                    MovementType.TRANSFER_OUT,
                    transfer.getTransferNumber(),
                    "In-transit to " + transfer.getToLocation().getName(),
                    "LOGISTICS"
            );
            movementRepository.save(movement);
        }

        transfer.setStatus(TransferStatus.IN_TRANSIT);
        transfer.setShippedDate(LocalDateTime.now());
        return transferRepository.save(transfer);
    }

    public StockTransfer receiveTransfer(Long transferId) {
        StockTransfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock transfer not found: " + transferId));

        if (transfer.getStatus() != TransferStatus.IN_TRANSIT) {
            throw new BusinessException("Transfer cannot be received. Must be IN_TRANSIT. Current: " + transfer.getStatus());
        }

        // Add to destination location
        for (StockTransferItem item : transfer.getItems()) {
            InventoryStock destStock = getOrCreateStock(item.getProduct().getId(), transfer.getToLocation().getId());
            destStock.setQuantityOnHand(destStock.getQuantityOnHand() + item.getQuantityShipped());
            destStock.setLastRestockedAt(LocalDateTime.now());
            stockRepository.save(destStock);

            item.setQuantityReceived(item.getQuantityShipped());

            StockMovement movement = new StockMovement(
                    item.getProduct(),
                    null,
                    transfer.getToLocation(),
                    item.getQuantityShipped(),
                    MovementType.TRANSFER_IN,
                    transfer.getTransferNumber(),
                    "Received transfer from " + transfer.getFromLocation().getName(),
                    "STORE_OPERATOR"
            );
            movementRepository.save(movement);
        }

        transfer.setStatus(TransferStatus.RECEIVED);
        transfer.setReceivedDate(LocalDateTime.now());
        return transferRepository.save(transfer);
    }

    public StockTransfer cancelTransfer(Long transferId) {
        StockTransfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock transfer not found: " + transferId));

        if (transfer.getStatus() == TransferStatus.RECEIVED || transfer.getStatus() == TransferStatus.IN_TRANSIT) {
            throw new BusinessException("Cannot cancel transfer in state: " + transfer.getStatus());
        }

        // Release reserved stock
        for (StockTransferItem item : transfer.getItems()) {
            InventoryStock sourceStock = getOrCreateStock(item.getProduct().getId(), transfer.getFromLocation().getId());
            sourceStock.setQuantityReserved(Math.max(0, sourceStock.getQuantityReserved() - item.getQuantityRequested()));
            stockRepository.save(sourceStock);
        }

        transfer.setStatus(TransferStatus.CANCELLED);
        return transferRepository.save(transfer);
    }

    @Transactional(readOnly = true)
    public List<StockTransfer> getAllTransfers() {
        return transferRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<StockMovement> getRecentMovements() {
        return movementRepository.findTop50ByOrderByMovementDateDesc();
    }
}
