package com.theatre.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Potlačí Spring Boot auto-konfiguráciu InMemoryUserDetailsManager
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> { throw new UsernameNotFoundException(username); };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Verejné — auth endpointy
                .requestMatchers("/api/auth/**").permitAll()
                // Verejné — čítanie
                .requestMatchers(HttpMethod.GET, "/api/shows/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/performances/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/halls/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/seats/**").permitAll()
                // Verejné — vytvorenie rezervácie (aj hostia)
                .requestMatchers(HttpMethod.POST, "/api/reservations").permitAll()
                // Verejné — uploads a H2
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                // Admin — správa inscenácií
                .requestMatchers(HttpMethod.POST, "/api/shows/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/shows/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/shows/**").hasRole("ADMIN")
                // Admin — správa hraní
                .requestMatchers(HttpMethod.POST, "/api/performances").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/performances/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/performances/**").hasRole("ADMIN")
                // Admin — správa sál
                .requestMatchers(HttpMethod.POST, "/api/halls").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/halls/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/halls/**").hasRole("ADMIN")
                // Admin — správa sedadiel
                .requestMatchers(HttpMethod.POST, "/api/seats").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/seats/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/seats/**").hasRole("ADMIN")
                // Admin — všetci používatelia a všetky rezervácie
                .requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/reservations").hasRole("ADMIN")
                // Zvyšok — prihlásený používateľ
                .anyRequest().authenticated()
            )
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
