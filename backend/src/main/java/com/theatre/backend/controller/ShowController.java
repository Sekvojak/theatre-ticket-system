package com.theatre.backend.controller;

import com.theatre.backend.dto.ImageUploadResponse;
import com.theatre.backend.entity.Show;
import com.theatre.backend.exception.BadRequestException;
import com.theatre.backend.service.ShowService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shows")
public class ShowController {

    private final ShowService showService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public ShowController(ShowService showService) {
        this.showService = showService;
    }

    @GetMapping
    public List<Show> getAllShows() {
        return showService.getAllShows();
    }

    @GetMapping("/{id}")
    public Show getShowById(@PathVariable Long id) {
        return showService.getShowById(id);
    }

    @PostMapping
    public Show createShow(@RequestBody Show show) {
        return showService.createShow(show);
    }

    @PutMapping("/{id}")
    public Show updateShow(@PathVariable Long id, @RequestBody Show show) {
        return showService.updateShow(id, show);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShow(@PathVariable Long id) {
        showService.deleteShow(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload")
    public ImageUploadResponse uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) throw new BadRequestException("Súbor je prázdny.");
        String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image";
        String ext = original.contains(".") ? original.substring(original.lastIndexOf('.')) : ".jpg";
        String filename = UUID.randomUUID() + ext;
        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(filename));
        return new ImageUploadResponse("/uploads/shows/" + filename);
    }
}
