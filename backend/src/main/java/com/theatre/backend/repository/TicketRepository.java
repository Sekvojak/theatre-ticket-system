package com.theatre.backend.repository;

import com.theatre.backend.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByReservationId(Long reservationId);

    List<Ticket> findBySeatId(Long seatId);
}