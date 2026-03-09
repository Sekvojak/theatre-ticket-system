package com.theatre.backend.controller;

import com.theatre.backend.entity.Ticket;
import com.theatre.backend.service.TicketService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public List<Ticket> getAllTickets() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/reservation/{reservationId}")
    public List<Ticket> getTicketsByReservationId(@PathVariable Long reservationId) {
        return ticketService.getTicketsByReservationId(reservationId);
    }

    @PostMapping
    public Ticket createTicket(@RequestBody Ticket ticket) {
        return ticketService.createTicket(ticket);
    }
}