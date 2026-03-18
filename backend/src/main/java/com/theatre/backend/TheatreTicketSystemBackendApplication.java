package com.theatre.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class TheatreTicketSystemBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(TheatreTicketSystemBackendApplication.class, args);
	}

}
