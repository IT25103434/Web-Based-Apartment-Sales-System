package com.apartment.listing.service;

import com.apartment.listing.exception.StorageException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.UUID;

@Service
public class MediaStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private Path rootLocation;
    private Path imagesLocation;
    private Path thumbnailsLocation;
    private Path floorPlansLocation;

    @PostConstruct
    public void init() {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.imagesLocation = this.rootLocation.resolve("images");
        this.thumbnailsLocation = this.rootLocation.resolve("thumbnails");
        this.floorPlansLocation = this.rootLocation.resolve("floorplans");

        try {
            Files.createDirectories(imagesLocation);
            Files.createDirectories(thumbnailsLocation);
            Files.createDirectories(floorPlansLocation);
        } catch (IOException e) {
            throw new StorageException("Could not initialize storage directories", e);
        }
    }

    public Path getImagesLocation() {
        return imagesLocation;
    }

    public Path getThumbnailsLocation() {
        return thumbnailsLocation;
    }

    public Path getFloorPlansLocation() {
        return floorPlansLocation;
    }

    public String storeFloorPlanPdf(MultipartFile file) {
        if (file.isEmpty()) {
            throw new StorageException("Failed to store empty file");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = getFileExtension(originalFilename).toLowerCase();

        if (!extension.equals("pdf")) {
            throw new StorageException("Only PDF files are allowed for floor plans. Uploaded type: " + extension);
        }

        String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename;
        try {
            Path destinationFile = this.floorPlansLocation.resolve(uniqueFilename).normalize();
            if (!destinationFile.getParent().equals(this.floorPlansLocation)) {
                throw new StorageException("Cannot store file outside current directory");
            }
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }
            return "/uploads/floorplans/" + uniqueFilename;
        } catch (IOException e) {
            throw new StorageException("Failed to store floor plan PDF file", e);
        }
    }

    public boolean deleteFileByUrl(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith("/uploads/")) {
            return false;
        }
        try {
            String relativePath = fileUrl.substring("/uploads/".length());
            Path filePath = this.rootLocation.resolve(relativePath).normalize();
            return Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Failed to delete file: " + fileUrl + " -> " + e.getMessage());
            return false;
        }
    }

    public String getFileExtension(String filename) {
        if (filename == null) return "";
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex == -1) ? "" : filename.substring(dotIndex + 1);
    }
}
