package com.armanmaurya.inventory.controller;

import com.armanmaurya.inventory.dto.BarcodeScanResultDTO;
import com.armanmaurya.inventory.dto.CycleCountRequestDTO;
import com.armanmaurya.inventory.dto.RfidScanRequestDTO;
import com.armanmaurya.inventory.dto.RfidScanResultDTO;
import com.armanmaurya.inventory.entity.CycleCountAudit;
import com.armanmaurya.inventory.service.ScannerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scanner")
@CrossOrigin(origins = "*")
public class ScannerController {

    private final ScannerService scannerService;

    public ScannerController(ScannerService scannerService) {
        this.scannerService = scannerService;
    }

    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<BarcodeScanResultDTO> scanBarcode(
            @PathVariable String barcode,
            @RequestParam(value = "locationId", required = false) Long locationId) {
        BarcodeScanResultDTO result = scannerService.scanBarcode(barcode, locationId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/rfid-batch")
    public ResponseEntity<RfidScanResultDTO> scanRfidBatch(@Valid @RequestBody RfidScanRequestDTO dto) {
        RfidScanResultDTO result = scannerService.scanRfidBatch(dto);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/cycle-count")
    public ResponseEntity<CycleCountAudit> performCycleCount(
            @Valid @RequestBody CycleCountRequestDTO dto,
            @RequestParam(value = "reconcile", defaultValue = "false") boolean reconcile) {
        CycleCountAudit audit = scannerService.performCycleCountAudit(dto, reconcile);
        return new ResponseEntity<>(audit, HttpStatus.CREATED);
    }

    @GetMapping("/audits")
    public ResponseEntity<List<CycleCountAudit>> getAllAudits() {
        return ResponseEntity.ok(scannerService.getAllAudits());
    }
}
