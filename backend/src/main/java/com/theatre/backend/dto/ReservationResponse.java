package com.theatre.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class ReservationResponse {

    private Long id;
    private Long performanceId;
    private String status;
    private LocalDateTime createdAt;

    private Long userId;
    private String guestName;
    private String guestEmail;

    private List<Long> seatIds;
}