package com.theatre.backend.dto;

public record LoginResponse(Long id, String name, String email, String role, String token) {}
