package com.theatre.backend.service;

import com.theatre.backend.entity.Performance;
import com.theatre.backend.entity.Show;
import com.theatre.backend.exception.NotFoundException;
import com.theatre.backend.repository.PerformanceRepository;
import com.theatre.backend.repository.ShowRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ShowService {

    private final ShowRepository showRepository;
    private final PerformanceRepository performanceRepository;
    private final PerformanceService performanceService;

    public ShowService(ShowRepository showRepository,
                       PerformanceRepository performanceRepository,
                       PerformanceService performanceService) {
        this.showRepository = showRepository;
        this.performanceRepository = performanceRepository;
        this.performanceService = performanceService;
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

    @Transactional
    public Show updateShow(Long id, Show updated) {
        Show existing = getShowById(id);
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setGenres(updated.getGenres());
        existing.setDurationMinutes(updated.getDurationMinutes());
        existing.setImageUrl(updated.getImageUrl());
        return showRepository.save(existing);
    }

    @Transactional
    public void deleteShow(Long id) {
        Show show = getShowById(id);
        List<Performance> performances = performanceRepository.findByShowId(id);
        for (Performance performance : performances) {
            performanceService.deletePerformance(performance.getId());
        }
        showRepository.delete(show);
    }
}
