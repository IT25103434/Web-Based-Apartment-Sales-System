package com.apartment.listing.service;

import com.apartment.listing.exception.BadRequestException;
import com.apartment.listing.exception.StorageException;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class ImageProcessingService {

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "webp");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    private final MediaStorageService mediaStorageService;

    public ImageProcessingService(MediaStorageService mediaStorageService) {
        this.mediaStorageService = mediaStorageService;
    }

    public ProcessedImageResult processAndSaveImage(MultipartFile file) {
        validateImageFile(file);

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = mediaStorageService.getFileExtension(originalFilename).toLowerCase();
        if (extension.isEmpty()) {
            extension = "jpg";
        }

        String baseName = UUID.randomUUID().toString();
        String fullImageName = baseName + "." + extension;
        String thumbImageName = baseName + "_thumb." + extension;

        Path fullPath = mediaStorageService.getImagesLocation().resolve(fullImageName);
        Path thumbPath = mediaStorageService.getThumbnailsLocation().resolve(thumbImageName);

        try {
            BufferedImage originalBufferedImage = ImageIO.read(file.getInputStream());
            if (originalBufferedImage == null) {
                throw new BadRequestException("Uploaded file is not a valid or readable image: " + originalFilename);
            }

            // 1. Process & Resize Original (Max 1920x1080)
            Thumbnails.of(originalBufferedImage)
                    .size(1920, 1080)
                    .outputQuality(0.85)
                    .toFile(fullPath.toFile());

            // 2. Generate Optimized Thumbnail (400x300 center crop / fit)
            Thumbnails.of(originalBufferedImage)
                    .size(400, 300)
                    .crop(net.coobird.thumbnailator.geometry.Positions.CENTER)
                    .outputQuality(0.80)
                    .toFile(thumbPath.toFile());

            String imageRelativeUrl = "/uploads/images/" + fullImageName;
            String thumbnailRelativeUrl = "/uploads/thumbnails/" + thumbImageName;

            return new ProcessedImageResult(imageRelativeUrl, thumbnailRelativeUrl);

        } catch (IOException e) {
            throw new StorageException("Failed to process and resize image: " + originalFilename, e);
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Cannot upload an empty image file");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Image file size exceeds limit of 10MB");
        }

        String filename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = mediaStorageService.getFileExtension(filename).toLowerCase();

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Unsupported image format: ." + extension + 
                ". Allowed formats are: JPG, JPEG, PNG, WebP.");
        }
    }

    public static class ProcessedImageResult {
        private final String imagePath;
        private final String thumbnailPath;

        public ProcessedImageResult(String imagePath, String thumbnailPath) {
            this.imagePath = imagePath;
            this.thumbnailPath = thumbnailPath;
        }

        public String getImagePath() {
            return imagePath;
        }

        public String getThumbnailPath() {
            return thumbnailPath;
        }
    }
}
