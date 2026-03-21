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
    private String showTitle;
    private LocalDateTime performanceStart;

    private String status;
    private LocalDateTime createdAt;

    private Long userId;
    private String customerName;
    private String customerEmail;

    private List<Long> seatIds;
    private List<String> seatLabels;
}