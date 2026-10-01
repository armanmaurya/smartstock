package com.armanmaurya.inventory.controller;

import com.armanmaurya.inventory.dto.StockAdjustmentDTO;
import com.armanmaurya.inventory.entity.InventoryStock;
import com.armanmaurya.inventory.entity.StockMovement;
import com.armanmaurya.inventory.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<List<InventoryStock>> getAllStocks() {
        return ResponseEntity.ok(inventoryService.getAllStocks());
    }

    @GetMapping("/location/{locationId}")
    public ResponseEntity<List<InventoryStock>> getStocksByLocation(@PathVariable Long locationId) {
        return ResponseEntity.ok(inventoryService.getStocksByLocation(locationId));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<InventoryStock>> getStocksByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getStocksByProduct(productId));
    }

    @GetMapping("/stock")
    public ResponseEntity<InventoryStock> getSpecificStock(@RequestParam Long productId, @RequestParam Long locationId) {
        return ResponseEntity.ok(inventoryService.getStock(productId, locationId));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryStock>> getLowStock(@RequestParam(value = "locationId", required = false) Long locationId) {
        return ResponseEntity.ok(inventoryService.getLowStockAlerts(locationId));
    }

    @GetMapping("/out-of-stock")
    public ResponseEntity<List<InventoryStock>> getOutOfStock(@RequestParam(value = "locationId", required = false) Long locationId) {
        return ResponseEntity.ok(inventoryService.getOutOfStockAlerts(locationId));
    }

    @PostMapping("/adjust")
    public ResponseEntity<InventoryStock> adjustStock(@Valid @RequestBody StockAdjustmentDTO dto) {
        return ResponseEntity.ok(inventoryService.adjustStock(dto));
    }

    @GetMapping("/movements")
    public ResponseEntity<List<StockMovement>> getRecentMovements() {
        return ResponseEntity.ok(inventoryService.getRecentMovements());
    }
}
