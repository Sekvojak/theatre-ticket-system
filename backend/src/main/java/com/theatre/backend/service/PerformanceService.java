package com.theatre.backend.service;

import com.theatre.backend.entity.Performance;
import com.theatre.backend.repository.PerformanceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PerformanceService {

    private final PerformanceRepository performanceRepository;

    public PerformanceService(PerformanceRepository performanceRepository) {
        this.performanceRepository = performanceRepository;
    }

    public List<Performance> getAllPerformances() {
        return performanceRepository.findAll();
    }

    public List<Performance> getPerformancesByShowId(Long showId) {
        return performanceRepository.findByShowId(showId);
    }

    public List<Performance> getPerformancesByHallId(Long hallId) {
        return performanceRepository.findByHallId(hallId);
    }

    public Performance createPerformance(Performance performance) {
        return performanceRepository.save(performance);
    }
}