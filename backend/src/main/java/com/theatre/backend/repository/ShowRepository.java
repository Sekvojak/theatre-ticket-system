package com.theatre.backend.repository;

import com.theatre.backend.entity.Show;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShowRepository extends JpaRepository<Show, Long> {
}
