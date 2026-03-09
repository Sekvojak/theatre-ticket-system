package com.theatre.backend.service;

import com.theatre.backend.entity.Hall;
import com.theatre.backend.repository.HallRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HallService {

    private final HallRepository hallRepository;

    public HallService(HallRepository hallRepository) {
        this.hallRepository = hallRepository;
    }

    public List<Hall> getAllHalls() {
        return hallRepository.findAll();
    }

    public Hall createHall(Hall hall) {
        return hallRepository.save(hall);
    }
}
