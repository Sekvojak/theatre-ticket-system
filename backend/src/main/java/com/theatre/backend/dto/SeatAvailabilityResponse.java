package com.theatre.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SeatAvailabilityResponse {

    private Long seatId;
    private Integer rowNumber;
    private Integer seatNumber;
    private boolean occupied;

}