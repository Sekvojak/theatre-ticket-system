package com.theatre.backend.controller;

import com.theatre.backend.entity.Hall;
import com.theatre.backend.service.HallService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/halls")
public class HallController {

    private final HallService hallService;

    public HallController(HallService hallService) {
        this.hallService = hallService;
    }

    @GetMapping
    public List<Hall> getAllHalls() {
        return hallService.getAllHalls();
    }

    @PostMapping
    public Hall createHall(@RequestBody Hall hall) {
        return hallService.createHall(hall);
    }
}