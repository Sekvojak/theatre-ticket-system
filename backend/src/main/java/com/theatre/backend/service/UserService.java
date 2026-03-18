package com.theatre.backend.service;

import com.theatre.backend.config.JwtUtil;
import com.theatre.backend.dto.LoginResponse;
import com.theatre.backend.dto.MessageResponse;
import com.theatre.backend.entity.Role;
import com.theatre.backend.entity.User;
import com.theatre.backend.exception.BadRequestException;
import com.theatre.backend.exception.ConflictException;
import com.theatre.backend.exception.NotFoundException;
import com.theatre.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public MessageResponse register(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new ConflictException("Používateľ s emailom '" + user.getEmail() + "' už existuje.");
        }
        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        user.setEmailVerified(false);
        user.setVerificationToken(UUID.randomUUID().toString());
        User saved = userRepository.save(user);
        emailService.sendVerificationEmail(saved);
        return new MessageResponse("Registrácia úspešná. Skontrolujte email a overte svoj účet.");
    }

    public LoginResponse login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Používateľ s emailom '" + email + "' nebol nájdený."));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadRequestException("Nesprávne heslo.");
        }
        if (!user.isEmailVerified()) {
            throw new BadRequestException("Váš účet nebol overený. Skontrolujte email a kliknite na overovací odkaz.");
        }
        String token = jwtUtil.generateToken(user);
        return new LoginResponse(user.getId(), user.getName(), user.getEmail(), user.getRole().name(), token);
    }

    public MessageResponse verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Neplatný alebo expirovaný overovací odkaz."));
        if (user.isEmailVerified()) {
            return new MessageResponse("Účet bol už overený. Môžete sa prihlásiť.");
        }
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
        return new MessageResponse("Váš účet bol úspešne overený. Môžete sa prihlásiť.");
    }
}
