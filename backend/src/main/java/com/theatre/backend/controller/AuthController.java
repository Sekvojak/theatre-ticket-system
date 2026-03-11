package com.theatre.backend.controller;

import com.theatre.backend.dto.LoginRequest;
import com.theatre.backend.dto.LoginResponse;
import com.theatre.backend.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return userService.login(request.email(), request.password());
    }
}
