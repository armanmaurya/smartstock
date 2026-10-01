package com.armanmaurya.inventory.controller;

import com.armanmaurya.inventory.dto.SalesOrderRequestDTO;
import com.armanmaurya.inventory.entity.SalesOrder;
import com.armanmaurya.inventory.service.SalesOrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales-orders")
@CrossOrigin(origins = "*")
public class SalesOrderController {

    private final SalesOrderService salesOrderService;

    public SalesOrderController(SalesOrderService salesOrderService) {
        this.salesOrderService = salesOrderService;
    }

    @GetMapping
    public ResponseEntity<List<SalesOrder>> getAllSalesOrders() {
        return ResponseEntity.ok(salesOrderService.getAllSalesOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalesOrder> getSalesOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(salesOrderService.getSalesOrderById(id));
    }

    @PostMapping
    public ResponseEntity<SalesOrder> createSalesOrder(@Valid @RequestBody SalesOrderRequestDTO dto) {
        SalesOrder order = salesOrderService.createSalesOrder(dto);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/fulfill")
    public ResponseEntity<SalesOrder> fulfillSalesOrder(@PathVariable Long id) {
        return ResponseEntity.ok(salesOrderService.fulfillSalesOrder(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<SalesOrder> cancelSalesOrder(@PathVariable Long id) {
        return ResponseEntity.ok(salesOrderService.cancelSalesOrder(id));
    }
}
