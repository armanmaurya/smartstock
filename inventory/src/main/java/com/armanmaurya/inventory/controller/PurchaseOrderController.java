package com.armanmaurya.inventory.controller;

import com.armanmaurya.inventory.dto.PurchaseOrderReceiveDTO;
import com.armanmaurya.inventory.dto.PurchaseOrderRequestDTO;
import com.armanmaurya.inventory.entity.PurchaseOrder;
import com.armanmaurya.inventory.service.PurchaseOrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
@CrossOrigin(origins = "*")
public class PurchaseOrderController {

    private final PurchaseOrderService poService;

    public PurchaseOrderController(PurchaseOrderService poService) {
        this.poService = poService;
    }

    @GetMapping
    public ResponseEntity<List<PurchaseOrder>> getAllPurchaseOrders() {
        return ResponseEntity.ok(poService.getAllPurchaseOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrder> getPurchaseOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(poService.getPurchaseOrderById(id));
    }

    @PostMapping
    public ResponseEntity<PurchaseOrder> createPurchaseOrder(@Valid @RequestBody PurchaseOrderRequestDTO dto) {
        PurchaseOrder created = poService.createPurchaseOrder(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/issue")
    public ResponseEntity<PurchaseOrder> issuePurchaseOrder(@PathVariable Long id) {
        return ResponseEntity.ok(poService.issuePurchaseOrder(id));
    }

    @PostMapping("/{id}/receive")
    public ResponseEntity<PurchaseOrder> receivePurchaseOrder(@PathVariable Long id, @Valid @RequestBody PurchaseOrderReceiveDTO dto) {
        return ResponseEntity.ok(poService.receivePurchaseOrder(id, dto));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<PurchaseOrder> cancelPurchaseOrder(@PathVariable Long id) {
        return ResponseEntity.ok(poService.cancelPurchaseOrder(id));
    }
}
