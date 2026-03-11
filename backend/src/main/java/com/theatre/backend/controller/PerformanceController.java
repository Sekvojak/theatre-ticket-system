package com.theatre.backend.controller;

import com.theatre.backend.dto.SeatAvailabilityResponse;
import com.theatre.backend.entity.Performance;
import com.theatre.backend.service.PerformanceService;
import com.theatre.backend.service.ReservationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/performances")
public class PerformanceController {

    private final PerformanceService performanceService;
    private final ReservationService reservationService;

    public PerformanceController(PerformanceService performanceService, ReservationService reservationService) {
        this.performanceService = performanceService;
        this.reservationService = reservationService;
    }

    @GetMapping
    public List<Performance> getAllPerformances() {
        return performanceService.getAllPerformances();
    }

    @GetMapping("/{id}")
    public Performance getPerformanceById(@PathVariable Long id) {
        return performanceService.getPerformanceById(id);
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

    @GetMapping("/{id}/occupied-seats")
    public List<Long> getOccupiedSeats(@PathVariable Long id) {
        return reservationService.getOccupiedSeatIds(id);
    }

    @GetMapping("/{id}/seats")
    public List<SeatAvailabilityResponse> getSeatMap(@PathVariable Long id) {
        return reservationService.getSeatMap(id);
    }
}
