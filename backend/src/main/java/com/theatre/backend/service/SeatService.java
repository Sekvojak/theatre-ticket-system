package com.theatre.backend.service;

import com.theatre.backend.entity.Seat;
import com.theatre.backend.repository.SeatRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SeatService {

    private final SeatRepository seatRepository;

    public SeatService(SeatRepository seatRepository) {
        this.seatRepository = seatRepository;
    }

    public List<Seat> getAllSeats() {
        return seatRepository.findAll();
    }

    public List<Seat> getSeatsByHallId(Long hallId) {
        return seatRepository.findByHallId(hallId);
    }

    public Seat createSeat(Seat seat) {
        return seatRepository.save(seat);
    }
}
