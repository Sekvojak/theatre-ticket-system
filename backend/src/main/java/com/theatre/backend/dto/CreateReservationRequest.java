package com.theatre.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateReservationRequest {

    private Long userId;
    private String guestName;
    private String guestEmail;
    private Long performanceId;
    private List<Long> seatIds;
}