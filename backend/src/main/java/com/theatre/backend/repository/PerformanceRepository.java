package com.theatre.backend.repository;

import com.theatre.backend.entity.Performance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PerformanceRepository extends JpaRepository<Performance, Long> {

    List<Performance> findByShowId(Long showId);

    List<Performance> findByHallId(Long hallId);
}