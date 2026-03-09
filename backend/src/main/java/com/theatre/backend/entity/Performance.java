package com.theatre.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "performances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Performance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PerformanceStatus status;

    @ManyToOne(optional = false)
    @JoinColumn(name = "show_id", nullable = false)
    private Show show;

    @ManyToOne(optional = false)
    @JoinColumn(name = "hall_id", nullable = false)
    private Hall hall;
}