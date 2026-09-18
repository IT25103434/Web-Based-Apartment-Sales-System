package com.apartment.backend.common;

import com.apartment.backend.common.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

/**
 * Saves uploaded files (listing photos, inspection photos, generated PDFs)
 * to a local folder on disk and returns a URL path the frontend can use
 * to display/download them ("/uploads/xxxx.jpg").
 *
 * Kept intentionally simple (local disk instead of cloud storage) since
 * this is a university project - it still keeps the code organized behind
 * one class so it could be swapped for S3/Cloudinary later without
 * touching the rest of the app.
 */
@Service
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final List<String> ALLOWED_IMAGE_TYPES =
            List.of("image/jpeg", "image/png", "image/webp");

    public String storeImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        if (!ALLOWED_IMAGE_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Only JPEG, PNG and WebP images are allowed");
        }
        return store(file, "img");
    }

    public String storeFile(MultipartFile file, String prefix) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        return store(file, prefix);
    }

    public String storeGeneratedFile(byte[] content, String fileName) {
        try {
            createUploadDirIfNeeded();
            Path targetPath = Paths.get(uploadDir).resolve(fileName);
            Files.write(targetPath, content);
            return "/uploads/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Could not save generated file: " + e.getMessage(), e);
        }
    }

    private String store(MultipartFile file, String prefix) {
        try {
            createUploadDirIfNeeded();

            String originalName = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename();
            String extension = "";
            int dotIndex = originalName.lastIndexOf('.');
            if (dotIndex >= 0) {
                extension = originalName.substring(dotIndex);
            }

            String newFileName = prefix + "_" + UUID.randomUUID() + extension;
            Path targetPath = Paths.get(uploadDir).resolve(newFileName);
            Files.copy(file.getInputStream(), targetPath);

            return "/uploads/" + newFileName;
        } catch (IOException e) {
            throw new RuntimeException("Could not store file: " + e.getMessage(), e);
        }
    }

    private void createUploadDirIfNeeded() throws IOException {
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            Files.createDirectories(dir.toPath());
        }
    }
}
