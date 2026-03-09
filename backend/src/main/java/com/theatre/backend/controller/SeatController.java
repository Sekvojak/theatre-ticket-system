package com.theatre.backend.controller;


import com.theatre.backend.entity.Seat;
import com.theatre.backend.service.SeatService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/seats")
public class SeatController {

    private final SeatService seatService;

    public SeatController(SeatService seatService) {
        this.seatService = seatService;
    }

    @GetMapping
    public List<Seat> getAllSeats() {
        return seatService.getAllSeats();
    }

    @GetMapping("/hall/{hallId}")
    public List<Seat> getSeatsByHallId(@PathVariable Long hallId) {
        return seatService.getSeatsByHallId(hallId);
    }

    @PostMapping
    public Seat createSeat(@RequestBody Seat seat) {
        return seatService.createSeat(seat);
    }
}
