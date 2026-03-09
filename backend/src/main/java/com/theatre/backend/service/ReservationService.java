package com.theatre.backend.service;

import com.theatre.backend.entity.Reservation;
import com.theatre.backend.entity.ReservationStatus;
import com.theatre.backend.exception.BadRequestException;
import com.theatre.backend.exception.ConflictException;
import com.theatre.backend.repository.ReservationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;

    public ReservationService(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    public List<Reservation> getReservationsByUserId(Long userId) {
        return reservationRepository.findByUserId(userId);
    }

    public Reservation createReservation(Reservation reservation) {
        if (reservation == null) {
            throw new IllegalArgumentException("Reservation must not be null.");
        }

        if (reservation.getPerformance() == null) {
            throw new IllegalArgumentException("Performance must not be null.");
        }

        validateReservationOwner(reservation);

        if (reservation.getStatus() == null) {
            reservation.setStatus(ReservationStatus.ACTIVE);
        }

        if (reservation.getCreatedAt() == null) {
            reservation.setCreatedAt(LocalDateTime.now());
        }

        return reservationRepository.save(reservation);
    }

    private void validateReservationOwner(Reservation reservation) {
        boolean hasUser = reservation.getUser() != null;
        boolean hasGuestName = hasText(reservation.getGuestName());
        boolean hasGuestEmail = hasText(reservation.getGuestEmail());
        boolean hasGuestData = hasGuestName || hasGuestEmail;

        if (hasUser && hasGuestData) {
            throw new BadRequestException("Reservation cannot have both user and guest data.");
        }

        if (!hasUser && !hasGuestName && !hasGuestEmail) {
            throw new BadRequestException("Reservation must have either user or guest data.");
        }

        if (!hasUser && (!hasGuestName || !hasGuestEmail)) {
            throw new BadRequestException("Guest reservation must contain both guestName and guestEmail.");
        }

        if (hasUser) {
            reservation.setGuestName(null);
            reservation.setGuestEmail(null);
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}