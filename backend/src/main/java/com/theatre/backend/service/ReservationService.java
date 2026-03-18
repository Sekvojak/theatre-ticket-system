package com.theatre.backend.service;

import com.theatre.backend.dto.CreateReservationRequest;
import com.theatre.backend.dto.ReservationResponse;
import com.theatre.backend.dto.SeatAvailabilityResponse;
import com.theatre.backend.entity.*;
import com.theatre.backend.exception.BadRequestException;
import com.theatre.backend.exception.ConflictException;
import com.theatre.backend.repository.PerformanceRepository;
import com.theatre.backend.repository.ReservationRepository;
import com.theatre.backend.repository.SeatRepository;
import com.theatre.backend.repository.TicketRepository;
import com.theatre.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final PerformanceRepository performanceRepository;
    private final TicketRepository ticketRepository;
    private final SeatRepository seatRepository;
    private final EmailService emailService;

    public ReservationService(ReservationRepository reservationRepository,
                              UserRepository userRepository,
                              PerformanceRepository performanceRepository,
                              TicketRepository ticketRepository,
                              SeatRepository seatRepository,
                              EmailService emailService) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.performanceRepository = performanceRepository;
        this.ticketRepository = ticketRepository;
        this.seatRepository = seatRepository;
        this.emailService = emailService;
    }

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    public List<Reservation> getReservationsByUserId(Long userId) {
        return reservationRepository.findByUserId(userId);
    }

    @Transactional
    public Reservation createReservation(Reservation reservation) {
        if (reservation == null) {
            throw new BadRequestException("Reservation must not be null.");
        }

        validateReservationOwner(reservation);
        attachExistingReferences(reservation);
        applyReservationDefaults(reservation);

        return reservationRepository.save(reservation);
    }

    @Transactional
    public Reservation createReservation(CreateReservationRequest request) {
        if (request == null) {
            throw new BadRequestException("Request must not be null.");
        }

        if (request.getPerformanceId() == null) {
            throw new BadRequestException("Performance id must be provided.");
        }

        Reservation reservation = new Reservation();

        if (request.getUserId() != null) {
            User user = new User();
            user.setId(request.getUserId());
            reservation.setUser(user);
        }

        Performance performance = new Performance();
        performance.setId(request.getPerformanceId());
        reservation.setPerformance(performance);

        reservation.setGuestName(request.getGuestName());
        reservation.setGuestEmail(request.getGuestEmail());

        if (request.getSeatIds() != null && !request.getSeatIds().isEmpty()) {
            return createReservationWithSeats(reservation, request.getSeatIds());
        }

        return createReservation(reservation);
    }

    @Transactional
    public Reservation createReservationWithSeats(Reservation reservation, List<Long> seatIds) {
        if (reservation == null) {
            throw new BadRequestException("Reservation must not be null.");
        }

        if (seatIds == null || seatIds.isEmpty()) {
            throw new BadRequestException("At least one seat must be selected.");
        }

        validateUniqueSeatIds(seatIds);
        validateReservationOwner(reservation);
        attachExistingReferences(reservation);
        applyReservationDefaults(reservation);

        Performance performance = reservation.getPerformance();
        validatePerformanceStatus(performance);

        List<Seat> seats = seatRepository.findAllById(seatIds);

        if (seats.size() != seatIds.size()) {
            throw new BadRequestException("One or more seats were not found.");
        }

        for (Seat seat : seats) {
            validateSeatBelongsToPerformanceHall(performance, seat);
            validateSeatAvailability(performance.getId(), seat.getId());
        }

        Reservation savedReservation = reservationRepository.save(reservation);

        List<Ticket> tickets = seats.stream()
                .map(seat -> Ticket.builder()
                        .reservation(savedReservation)
                        .seat(seat)
                        .price(seat.getPrice())
                        .build())
                .toList();

        ticketRepository.saveAll(tickets);
        emailService.sendReservationConfirmation(savedReservation, tickets);

        return savedReservation;
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
    }

    private void attachExistingReferences(Reservation reservation) {
        if (reservation.getPerformance() == null || reservation.getPerformance().getId() == null) {
            throw new BadRequestException("Performance id must be provided.");
        }

        Performance performance = performanceRepository.findById(reservation.getPerformance().getId())
                .orElseThrow(() -> new BadRequestException("Performance not found."));

        reservation.setPerformance(performance);

        if (reservation.getUser() != null) {
            if (reservation.getUser().getId() == null) {
                throw new BadRequestException("User id must be provided.");
            }

            User user = userRepository.findById(reservation.getUser().getId())
                    .orElseThrow(() -> new BadRequestException("User not found."));

            reservation.setUser(user);
        }
    }

    private void applyReservationDefaults(Reservation reservation) {
        if (reservation.getStatus() == null) {
            reservation.setStatus(ReservationStatus.ACTIVE);
        }

        if (reservation.getCreatedAt() == null) {
            reservation.setCreatedAt(LocalDateTime.now());
        }
    }

    private void validateSeatBelongsToPerformanceHall(Performance performance, Seat seat) {
        if (!seat.getHall().getId().equals(performance.getHall().getId())) {
            throw new BadRequestException("Seat does not belong to the hall of this performance.");
        }
    }

    private void validateSeatAvailability(Long performanceId, Long seatId) {
        boolean occupied = ticketRepository.existsBySeatIdAndPerformanceIdAndReservationStatus(
                seatId,
                performanceId,
                ReservationStatus.ACTIVE
        );

        if (occupied) {
            throw new ConflictException("Seat is already reserved for this performance.");
        }
    }

    private void validateUniqueSeatIds(List<Long> seatIds) {
        long uniqueCount = seatIds.stream().distinct().count();

        if (uniqueCount != seatIds.size()) {
            throw new BadRequestException("Seat list contains duplicates.");
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    public List<Long> getOccupiedSeatIds(Long performanceId) {
        if (performanceId == null) {
            throw new BadRequestException("Performance id must be provided.");
        }

        if (!performanceRepository.existsById(performanceId)) {
            throw new BadRequestException("Performance not found.");
        }

        return ticketRepository.findOccupiedSeatIdsByPerformanceIdAndReservationStatus(
                performanceId,
                ReservationStatus.ACTIVE);
    }

    @Transactional
    public Reservation cancelReservation(Long reservationId) {

        if (reservationId == null) {
            throw new BadRequestException("Reservation id must be provided.");
        }

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new BadRequestException("Reservation not found."));

        if (reservation.getStatus() == ReservationStatus.CANCELED) {
            throw new ConflictException("Reservation is already cancelled.");
        }

        reservation.setStatus(ReservationStatus.CANCELED);
        Reservation saved = reservationRepository.save(reservation);
        emailService.sendReservationCancellation(saved);
        return saved;
    }

    private void validatePerformanceStatus(Performance performance) {

        if (performance.getStatus() != PerformanceStatus.SCHEDULED) {
            throw new ConflictException("Reservation cannot be created for this performance.");
        }

    }

    public List<SeatAvailabilityResponse> getSeatMap(Long performanceId) {

        Performance performance = performanceRepository.findById(performanceId)
                .orElseThrow(() -> new BadRequestException("Performance not found."));

        Long hallId = performance.getHall().getId();

        List<Seat> seats = seatRepository.findByHallId(hallId);

        List<Long> occupiedSeats = ticketRepository
                .findOccupiedSeatIdsByPerformanceIdAndReservationStatus(
                        performanceId,
                        ReservationStatus.ACTIVE
                );

        return seats.stream()
                .map(seat -> new SeatAvailabilityResponse(
                        seat.getId(),
                        seat.getRowNumber(),
                        seat.getSeatNumber(),
                        occupiedSeats.contains(seat.getId())
                ))
                .toList();
    }

    public ReservationResponse mapToResponse(Reservation reservation) {

        List<Long> seatIds = ticketRepository.findByReservationId(reservation.getId())
                .stream()
                .map(ticket -> ticket.getSeat().getId())
                .toList();

        return ReservationResponse.builder()
                .id(reservation.getId())
                .performanceId(reservation.getPerformance().getId())
                .status(reservation.getStatus().name())
                .createdAt(reservation.getCreatedAt())
                .userId(reservation.getUser() != null ? reservation.getUser().getId() : null)
                .guestName(reservation.getGuestName())
                .guestEmail(reservation.getGuestEmail())
                .seatIds(seatIds)
                .build();
    }

    public ReservationResponse getReservationById(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new BadRequestException("Reservation not found"));

        return mapToResponse(reservation);
    }
}