package com.theatre.backend.service;

import com.theatre.backend.entity.Show;
import com.theatre.backend.exception.NotFoundException;
import com.theatre.backend.repository.ShowRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShowService {

    private final ShowRepository showRepository;

    public ShowService(ShowRepository showRepository) {
        this.showRepository = showRepository;
    }

    public List<Show> getAllShows() {
        return showRepository.findAll();
    }

    public Show getShowById(Long id) {
        return showRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Show with id " + id + " not found."));
    }

    public Show createShow(Show show) {
        return showRepository.save(show);
    }
}
