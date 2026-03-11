package com.theatre.backend.service;

import com.theatre.backend.dto.LoginRequest;
import com.theatre.backend.dto.LoginResponse;
import com.theatre.backend.entity.Role;
import com.theatre.backend.entity.User;
import com.theatre.backend.exception.BadRequestException;
import com.theatre.backend.exception.ConflictException;
import com.theatre.backend.exception.NotFoundException;
import com.theatre.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new ConflictException("User with email '" + user.getEmail() + "' already exists.");
        }
        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }
        if (user.getCreatedAt() == null) {
            user.setCreatedAt(LocalDateTime.now());
        }
        return userRepository.save(user);
    }

    public LoginResponse login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User with email '" + email + "' not found."));
        if (!user.getPassword().equals(password)) {
            throw new BadRequestException("Invalid password.");
        }
        return new LoginResponse(user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
}
