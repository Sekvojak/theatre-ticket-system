package com.theatre.backend.controller;

import com.theatre.backend.entity.Performance;
import com.theatre.backend.service.PerformanceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/performances")
public class PerformanceController {

    private final PerformanceService performanceService;

    public PerformanceController(PerformanceService performanceService) {
        this.performanceService = performanceService;
    }

    @GetMapping
    public List<Performance> getAllPerformances() {
        return performanceService.getAllPerformances();
    }

    @GetMapping("/show/{showId}")
    public List<Performance> getPerformancesByShowId(@PathVariable Long showId) {
        return performanceService.getPerformancesByShowId(showId);
    }

    @GetMapping("/hall/{hallId}")
    public List<Performance> getPerformancesByHallId(@PathVariable Long hallId) {
        return performanceService.getPerformancesByHallId(hallId);
    }

    @PostMapping
    public Performance createPerformance(@RequestBody Performance performance) {
        return performanceService.createPerformance(performance);
    }
}