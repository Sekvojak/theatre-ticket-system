package com.theatre.backend.controller;

import com.theatre.backend.entity.Show;
import com.theatre.backend.service.ShowService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shows")
public class ShowController {

    private final ShowService showService;

    public ShowController(ShowService showService) {
        this.showService = showService;
    }

    @GetMapping
    public List<Show> getAllShows() {
        return showService.getAllShows();
    }

    @GetMapping("/{id}")
    public Show getShowById(@PathVariable Long id) {
        return showService.getShowById(id);
    }

    @PostMapping
    public Show createShow(@RequestBody Show show) {
        return showService.createShow(show);
    }
}
