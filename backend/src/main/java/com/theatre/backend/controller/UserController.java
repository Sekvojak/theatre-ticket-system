package com.theatre.backend.controller;

import com.theatre.backend.entity.Reservation;
import com.theatre.backend.entity.User;
import com.theatre.backend.service.ReservationService;
import com.theatre.backend.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final ReservationService reservationService;

    public UserController(UserService userService, ReservationService reservationService) {
        this.userService = userService;
        this.reservationService = reservationService;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}/reservations")
    public List<Reservation> getUserReservations(@PathVariable Long id) {
        return reservationService.getReservationsByUserId(id);
    }
}