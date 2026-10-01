package com.armanmaurya.inventory.controller;

import com.armanmaurya.inventory.dto.StockTransferRequestDTO;
import com.armanmaurya.inventory.entity.StockTransfer;
import com.armanmaurya.inventory.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transfers")
@CrossOrigin(origins = "*")
public class StockTransferController {

    private final InventoryService inventoryService;

    public StockTransferController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<List<StockTransfer>> getAllTransfers() {
        return ResponseEntity.ok(inventoryService.getAllTransfers());
    }

    @PostMapping
    public ResponseEntity<StockTransfer> createTransfer(@Valid @RequestBody StockTransferRequestDTO dto) {
        StockTransfer transfer = inventoryService.createStockTransfer(dto);
        return new ResponseEntity<>(transfer, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<StockTransfer> approveTransfer(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.approveTransfer(id));
    }

    @PutMapping("/{id}/ship")
    public ResponseEntity<StockTransfer> shipTransfer(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.shipTransfer(id));
    }

    @PutMapping("/{id}/receive")
    public ResponseEntity<StockTransfer> receiveTransfer(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.receiveTransfer(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<StockTransfer> cancelTransfer(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.cancelTransfer(id));
    }
}
