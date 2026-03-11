package com.theatre.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Použije CORS konfiguráciu z CorsConfig (WebMvcConfigurer)
            .cors(Customizer.withDefaults())
            // REST API je stateless — CSRF ochrana nie je potrebná
            .csrf(csrf -> csrf.disable())
            // Bez HTTP sessions
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Všetky API endpointy sú verejné (auth riešime na úrovni aplikácie)
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            )
            // H2 konzola beží v iframe — treba vypnúť X-Frame-Options
            .headers(headers -> headers
                .frameOptions(frame -> frame.disable())
            );

        return http.build();
    }
}
