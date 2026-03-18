package com.theatre.backend.repository;

import com.theatre.backend.entity.ReservationStatus;
import com.theatre.backend.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByReservationId(Long reservationId);

    List<Ticket> findBySeatId(Long seatId);

    @Query("""
        select count(t) > 0
        from Ticket t
        where t.seat.id = :seatId
          and t.reservation.performance.id = :performanceId
          and t.reservation.status = :status
    """)
    boolean existsBySeatIdAndPerformanceIdAndReservationStatus(
            @Param("seatId") Long seatId,
            @Param("performanceId") Long performanceId,
            @Param("status") ReservationStatus status
    );

    @Query("""
        select t.seat.id
        from Ticket t
        where t.reservation.performance.id = :performanceId
          and t.reservation.status = :status
    """)
    List<Long> findOccupiedSeatIdsByPerformanceIdAndReservationStatus(
            @Param("performanceId") Long performanceId,
            @Param("status") ReservationStatus status
    );

    void deleteByReservationId(Long reservationId);
}