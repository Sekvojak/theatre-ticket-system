package com.theatre.backend.service;

import com.theatre.backend.entity.Seat;
import com.theatre.backend.exception.NotFoundException;
import com.theatre.backend.repository.SeatRepository;
import com.theatre.backend.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SeatService {

    private final SeatRepository seatRepository;
    private final TicketRepository ticketRepository;

    public SeatService(SeatRepository seatRepository, TicketRepository ticketRepository) {
        this.seatRepository = seatRepository;
        this.ticketRepository = ticketRepository;
    }

    public List<Seat> getAllSeats() {
        return seatRepository.findAll();
    }

    public List<Seat> getSeatsByHallId(Long hallId) {
        return seatRepository.findByHallId(hallId);
    }

    public Seat getSeatById(Long id) {
        return seatRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Seat with id " + id + " not found."));
    }

    public Seat createSeat(Seat seat) {
        return seatRepository.save(seat);
    }

    @Transactional
    public Seat updateSeat(Long id, Seat updated) {
        Seat existing = getSeatById(id);
        existing.setRowNumber(updated.getRowNumber());
        existing.setSeatNumber(updated.getSeatNumber());
        existing.setPrice(updated.getPrice());
        return seatRepository.save(existing);
    }

    @Transactional
    public void deleteSeat(Long id) {
        Seat seat = getSeatById(id);
        ticketRepository.deleteAll(ticketRepository.findBySeatId(id));
        seatRepository.delete(seat);
    }
}
