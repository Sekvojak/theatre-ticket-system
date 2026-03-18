package com.theatre.backend.controller;

import com.theatre.backend.entity.Hall;
import com.theatre.backend.service.HallService;
import org.springframework.http.ResponseEntity;
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

    @GetMapping("/{id}")
    public Hall getHallById(@PathVariable Long id) {
        return hallService.getHallById(id);
    }

    @PostMapping
    public Hall createHall(@RequestBody Hall hall) {
        return hallService.createHall(hall);
    }

    @PutMapping("/{id}")
    public Hall updateHall(@PathVariable Long id, @RequestBody Hall hall) {
        return hallService.updateHall(id, hall);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHall(@PathVariable Long id) {
        hallService.deleteHall(id);
        return ResponseEntity.noContent().build();
    }
}