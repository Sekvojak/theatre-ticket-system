package com.theatre.backend.controller;

import com.theatre.backend.dto.CreateReservationRequest;
import com.theatre.backend.entity.Reservation;
import com.theatre.backend.service.ReservationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping
    public List<Reservation> getAllReservations() {
        return reservationService.getAllReservations();
    }

    @PostMapping
    public Reservation createReservation(@RequestBody CreateReservationRequest request) {
        return reservationService.createReservation(request);
    }
}