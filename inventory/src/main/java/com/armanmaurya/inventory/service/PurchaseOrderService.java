package com.armanmaurya.inventory.service;

import com.armanmaurya.inventory.dto.PurchaseOrderItemDTO;
import com.armanmaurya.inventory.dto.PurchaseOrderReceiveDTO;
import com.armanmaurya.inventory.dto.PurchaseOrderRequestDTO;
import com.armanmaurya.inventory.entity.*;
import com.armanmaurya.inventory.enums.MovementType;
import com.armanmaurya.inventory.enums.PurchaseOrderStatus;
import com.armanmaurya.inventory.exception.BusinessException;
import com.armanmaurya.inventory.exception.ResourceNotFoundException;
import com.armanmaurya.inventory.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class PurchaseOrderService {

    private final PurchaseOrderRepository poRepository;
    private final SupplierRepository supplierRepository;
    private final LocationRepository locationRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final InventoryStockRepository stockRepository;
    private final StockMovementRepository movementRepository;

    public PurchaseOrderService(PurchaseOrderRepository poRepository,
                                SupplierRepository supplierRepository,
                                LocationRepository locationRepository,
                                ProductRepository productRepository,
                                InventoryService inventoryService,
                                InventoryStockRepository stockRepository,
                                StockMovementRepository movementRepository) {
        this.poRepository = poRepository;
        this.supplierRepository = supplierRepository;
        this.locationRepository = locationRepository;
        this.productRepository = productRepository;
        this.inventoryService = inventoryService;
        this.stockRepository = stockRepository;
        this.movementRepository = movementRepository;
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrder> getAllPurchaseOrders() {
        return poRepository.findAll();
    }

    @Transactional(readOnly = true)
    public PurchaseOrder getPurchaseOrderById(Long id) {
        return poRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public PurchaseOrder getPurchaseOrderByPoNumber(String poNumber) {
        return poRepository.findByPoNumber(poNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with PO Number: " + poNumber));
    }

    public PurchaseOrder createPurchaseOrder(PurchaseOrderRequestDTO dto) {
        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + dto.getSupplierId()));

        Location location = locationRepository.findById(dto.getDestinationLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination location not found: " + dto.getDestinationLocationId()));

        String poNumber = "PO-" + System.currentTimeMillis();
        PurchaseOrder po = new PurchaseOrder(poNumber, supplier, location, dto.getExpectedDeliveryDate(), dto.getNotes());

        for (PurchaseOrderItemDTO itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemDto.getProductId()));

            PurchaseOrderItem item = new PurchaseOrderItem(product, itemDto.getQuantityOrdered(), itemDto.getUnitPrice());
            po.addItem(item);
        }

        return poRepository.save(po);
    }

    public PurchaseOrder issuePurchaseOrder(Long id) {
        PurchaseOrder po = getPurchaseOrderById(id);
        if (po.getStatus() != PurchaseOrderStatus.DRAFT) {
            throw new BusinessException("Only DRAFT purchase orders can be issued. Current status: " + po.getStatus());
        }
        po.setStatus(PurchaseOrderStatus.ISSUED);
        return poRepository.save(po);
    }

    public PurchaseOrder receivePurchaseOrder(Long id, PurchaseOrderReceiveDTO dto) {
        PurchaseOrder po = getPurchaseOrderById(id);
        if (po.getStatus() != PurchaseOrderStatus.ISSUED && po.getStatus() != PurchaseOrderStatus.PARTIALLY_RECEIVED) {
            throw new BusinessException("Cannot receive items for PO in status: " + po.getStatus());
        }

        Map<Long, Integer> receivingMap = dto.getItems().stream()
                .collect(Collectors.toMap(PurchaseOrderReceiveDTO.ReceiveItem::getProductId, PurchaseOrderReceiveDTO.ReceiveItem::getQuantityReceived));

        boolean allReceived = true;

        for (PurchaseOrderItem item : po.getItems()) {
            Long prodId = item.getProduct().getId();
            if (receivingMap.containsKey(prodId)) {
                int qtyToReceive = receivingMap.get(prodId);
                int totalReceivedSoFar = item.getQuantityReceived() + qtyToReceive;

                if (totalReceivedSoFar > item.getQuantityOrdered()) {
                    throw new BusinessException("Cannot receive more than ordered for product: " + item.getProduct().getSku() +
                            ". Ordered: " + item.getQuantityOrdered() + ", Already received: " + item.getQuantityReceived() + ", Attempted: " + qtyToReceive);
                }

                item.setQuantityReceived(totalReceivedSoFar);

                // Add to inventory stock
                InventoryStock stock = inventoryService.getOrCreateStock(prodId, po.getDestinationLocation().getId());
                stock.setQuantityOnHand(stock.getQuantityOnHand() + qtyToReceive);
                stock.setLastRestockedAt(LocalDateTime.now());
                stockRepository.save(stock);

                // Audit stock movement
                StockMovement movement = new StockMovement(
                        item.getProduct(),
                        null,
                        po.getDestinationLocation(),
                        qtyToReceive,
                        MovementType.RECEIPT,
                        po.getPoNumber(),
                        "PO Receiving from " + po.getSupplier().getName(),
                        dto.getReceivedBy()
                );
                movementRepository.save(movement);
            }

            if (item.getQuantityReceived() < item.getQuantityOrdered()) {
                allReceived = false;
            }
        }

        po.setStatus(allReceived ? PurchaseOrderStatus.COMPLETED : PurchaseOrderStatus.PARTIALLY_RECEIVED);
        return poRepository.save(po);
    }

    public PurchaseOrder cancelPurchaseOrder(Long id) {
        PurchaseOrder po = getPurchaseOrderById(id);
        if (po.getStatus() == PurchaseOrderStatus.COMPLETED || po.getStatus() == PurchaseOrderStatus.PARTIALLY_RECEIVED) {
            throw new BusinessException("Cannot cancel PO with status: " + po.getStatus());
        }
        po.setStatus(PurchaseOrderStatus.CANCELLED);
        return poRepository.save(po);
    }
}
