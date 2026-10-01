package com.armanmaurya.inventory.controller;

import com.armanmaurya.inventory.dto.DashboardKpiDTO;
import com.armanmaurya.inventory.dto.ReorderRecommendationDTO;
import com.armanmaurya.inventory.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/kpi")
    public ResponseEntity<DashboardKpiDTO> getDashboardKpi() {
        return ResponseEntity.ok(reportService.getDashboardKpi());
    }

    @GetMapping("/reorder-recommendations")
    public ResponseEntity<List<ReorderRecommendationDTO>> getReorderRecommendations() {
        return ResponseEntity.ok(reportService.getReorderRecommendations());
    }
}
