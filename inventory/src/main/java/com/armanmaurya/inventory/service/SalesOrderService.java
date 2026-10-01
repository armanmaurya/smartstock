package com.armanmaurya.inventory.service;

import com.armanmaurya.inventory.dto.SalesOrderItemDTO;
import com.armanmaurya.inventory.dto.SalesOrderRequestDTO;
import com.armanmaurya.inventory.entity.*;
import com.armanmaurya.inventory.enums.MovementType;
import com.armanmaurya.inventory.enums.SalesOrderStatus;
import com.armanmaurya.inventory.exception.BusinessException;
import com.armanmaurya.inventory.exception.InsufficientStockException;
import com.armanmaurya.inventory.exception.ResourceNotFoundException;
import com.armanmaurya.inventory.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SalesOrderService {

    private final SalesOrderRepository salesOrderRepository;
    private final LocationRepository locationRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final InventoryStockRepository stockRepository;
    private final StockMovementRepository movementRepository;

    public SalesOrderService(SalesOrderRepository salesOrderRepository,
                             LocationRepository locationRepository,
                             ProductRepository productRepository,
                             InventoryService inventoryService,
                             InventoryStockRepository stockRepository,
                             StockMovementRepository movementRepository) {
        this.salesOrderRepository = salesOrderRepository;
        this.locationRepository = locationRepository;
        this.productRepository = productRepository;
        this.inventoryService = inventoryService;
        this.stockRepository = stockRepository;
        this.movementRepository = movementRepository;
    }

    @Transactional(readOnly = true)
    public List<SalesOrder> getAllSalesOrders() {
        return salesOrderRepository.findAll();
    }

    @Transactional(readOnly = true)
    public SalesOrder getSalesOrderById(Long id) {
        return salesOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sales Order not found with ID: " + id));
    }

    public SalesOrder createSalesOrder(SalesOrderRequestDTO dto) {
        Location location = locationRepository.findById(dto.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found: " + dto.getLocationId()));

        String orderNumber = "SO-" + System.currentTimeMillis();
        SalesOrder order = new SalesOrder(orderNumber, location, dto.getCustomerName(), dto.getCustomerEmail());

        for (SalesOrderItemDTO itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemDto.getProductId()));

            InventoryStock stock = inventoryService.getOrCreateStock(product.getId(), location.getId());
            if (stock.getAvailableQuantity() < itemDto.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for product " + product.getName() + " (" + product.getSku() +
                        ") at " + location.getName() + ". Available: " + stock.getAvailableQuantity() + ", Requested: " + itemDto.getQuantity());
            }

            // Reserve stock
            stock.setQuantityReserved(stock.getQuantityReserved() + itemDto.getQuantity());
            stockRepository.save(stock);

            SalesOrderItem item = new SalesOrderItem(product, itemDto.getQuantity(), itemDto.getUnitPrice());
            order.addItem(item);
        }

        order.setStatus(SalesOrderStatus.CONFIRMED);
        return salesOrderRepository.save(order);
    }

    public SalesOrder fulfillSalesOrder(Long id) {
        SalesOrder order = getSalesOrderById(id);
        if (order.getStatus() != SalesOrderStatus.CONFIRMED && order.getStatus() != SalesOrderStatus.PACKED) {
            throw new BusinessException("Order cannot be fulfilled from current status: " + order.getStatus());
        }

        for (SalesOrderItem item : order.getItems()) {
            InventoryStock stock = inventoryService.getOrCreateStock(item.getProduct().getId(), order.getLocation().getId());
            stock.setQuantityOnHand(stock.getQuantityOnHand() - item.getQuantity());
            stock.setQuantityReserved(Math.max(0, stock.getQuantityReserved() - item.getQuantity()));
            stockRepository.save(stock);

            StockMovement movement = new StockMovement(
                    item.getProduct(),
                    order.getLocation(),
                    null,
                    item.getQuantity(),
                    MovementType.SHIPMENT,
                    order.getOrderNumber(),
                    "Customer sale fulfillment: " + order.getCustomerName(),
                    "POS_CASHIER"
            );
            movementRepository.save(movement);
        }

        order.setStatus(SalesOrderStatus.DELIVERED);
        return salesOrderRepository.save(order);
    }

    public SalesOrder cancelSalesOrder(Long id) {
        SalesOrder order = getSalesOrderById(id);
        if (order.getStatus() == SalesOrderStatus.DELIVERED || order.getStatus() == SalesOrderStatus.SHIPPED) {
            throw new BusinessException("Cannot cancel order in status: " + order.getStatus());
        }

        // Release reserved quantities
        for (SalesOrderItem item : order.getItems()) {
            InventoryStock stock = inventoryService.getOrCreateStock(item.getProduct().getId(), order.getLocation().getId());
            stock.setQuantityReserved(Math.max(0, stock.getQuantityReserved() - item.getQuantity()));
            stockRepository.save(stock);
        }

        order.setStatus(SalesOrderStatus.CANCELLED);
        return salesOrderRepository.save(order);
    }
}
