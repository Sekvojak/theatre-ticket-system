package com.theatre.backend.service;

import com.theatre.backend.entity.Hall;
import com.theatre.backend.entity.Performance;
import com.theatre.backend.exception.NotFoundException;
import com.theatre.backend.repository.HallRepository;
import com.theatre.backend.repository.PerformanceRepository;
import com.theatre.backend.repository.SeatRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HallService {

    private final HallRepository hallRepository;
    private final PerformanceRepository performanceRepository;
    private final SeatRepository seatRepository;
    private final PerformanceService performanceService;

    public HallService(HallRepository hallRepository,
                       PerformanceRepository performanceRepository,
                       SeatRepository seatRepository,
                       PerformanceService performanceService) {
        this.hallRepository = hallRepository;
        this.performanceRepository = performanceRepository;
        this.seatRepository = seatRepository;
        this.performanceService = performanceService;
    }

    public List<Hall> getAllHalls() {
        return hallRepository.findAll();
    }

    public Hall getHallById(Long id) {
        return hallRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Hall with id " + id + " not found."));
    }

    public Hall createHall(Hall hall) {
        return hallRepository.save(hall);
    }

    @Transactional
    public Hall updateHall(Long id, Hall updated) {
        Hall existing = getHallById(id);
        existing.setName(updated.getName());
        existing.setCapacity(updated.getCapacity());
        return hallRepository.save(existing);
    }

    @Transactional
    public void deleteHall(Long id) {
        Hall hall = getHallById(id);
        List<Performance> performances = performanceRepository.findByHallId(id);
        for (Performance performance : performances) {
            performanceService.deletePerformance(performance.getId());
        }
        seatRepository.deleteAll(seatRepository.findByHallId(id));
        hallRepository.delete(hall);
    }
}
