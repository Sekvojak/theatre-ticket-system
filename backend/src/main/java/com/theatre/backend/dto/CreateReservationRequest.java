package com.theatre.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
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

    @Email(message = "Guest email must be valid.")
    private String guestEmail;

    @NotNull(message = "Performance id must be provided.")
    private Long performanceId;

    private List<Long> seatIds;
}