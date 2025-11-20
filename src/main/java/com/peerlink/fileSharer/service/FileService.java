package com.peerlink.fileSharer.service;

import com.amazonaws.HttpMethod;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.peerlink.fileSharer.model.FileRecord;
import com.peerlink.fileSharer.model.User;
import com.peerlink.fileSharer.repository.FileRecordRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.net.URL;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.List; 

@Service
public class FileService {

    private final AmazonS3 amazonS3;
    private final FileRecordRepository fileRecordRepository;

    @Value("${app.aws.s3.bucket-name}")
    private String bucketName;
    
    // Constructor Injection (Spring Boot automatically provides the AmazonS3 client)
    public FileService(AmazonS3 amazonS3, FileRecordRepository fileRecordRepository) {
        this.amazonS3 = amazonS3;
        this.fileRecordRepository = fileRecordRepository;
    }

    /**
     * Uploads the file to S3 and creates a record in PostgreSQL for logged-in users.
     */
    public FileRecord uploadFile(MultipartFile file, User user) throws IOException {
        
        // 1. Generate unique IDs
        String shareCode = generateUniqueShareCode();
        String s3ObjectKey = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

        // 2. Prepare Metadata and Upload to S3
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());
        metadata.setContentType(file.getContentType());
        
        amazonS3.putObject(
            new PutObjectRequest(bucketName, s3ObjectKey, file.getInputStream(), metadata)
        );

        // 3. Save Metadata to PostgreSQL
        FileRecord record = new FileRecord();
        record.setShareCode(shareCode);
        record.setS3ObjectKey(s3ObjectKey);
        record.setOriginalFilename(file.getOriginalFilename());
        record.setUser(user);
        
        return fileRecordRepository.save(record);
    }
    
    /**
     * Generates a time-limited download URL for a file using its share code.
     * @return The pre-signed URL string, or null if the file is not found.
     */
    public String generateDownloadUrl(String shareCode) {
        FileRecord record = fileRecordRepository.findByShareCode(shareCode)
                .orElse(null);

        if (record == null) {
            return null; // File not found
        }

        // The URL is valid for 10 minutes
        Date expiration = Date.from(Instant.now().plusSeconds(600)); 
        
        // 1. Create the request to S3 with response headers to force download
        GeneratePresignedUrlRequest urlRequest = new GeneratePresignedUrlRequest(
            bucketName, record.getS3ObjectKey()
        )
            .withMethod(HttpMethod.GET)
            .withExpiration(expiration);
        
        // Force download with original filename
        urlRequest.addRequestParameter("response-content-disposition", 
            "attachment; filename=\"" + record.getOriginalFilename() + "\"");
        urlRequest.addRequestParameter("response-content-type", "application/octet-stream");
        
        // 2. Generate and return the secure URL
        URL url = amazonS3.generatePresignedUrl(urlRequest);
        
        // 3. Update download count in PostgreSQL (optional but good for stats)
        record.setDownloadCount(record.getDownloadCount() + 1);
        fileRecordRepository.save(record);

        return url.toString();
    }
    
    /**
     * Generates a unique 5-digit numeric share code (like the old port logic)
     */
    private String generateUniqueShareCode() {
        String shareCode;
        int attempts = 0;
        final int MAX_ATTEMPTS = 10;
        
        do {
            int randomInt = ThreadLocalRandom.current().nextInt(10000, 99999);
            shareCode = String.valueOf(randomInt);
            attempts++;
            
            if (attempts >= MAX_ATTEMPTS) {
                // Fallback to UUID if we can't find a unique 5-digit code
                shareCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                break;
            }
        } while (fileRecordRepository.findByShareCode(shareCode).isPresent());
        
        return shareCode;
    }
    
    /**
     * Deletes the file from S3 and removes the record from PostgreSQL.
     */
    public void deleteFile(String shareCode, Long userId) {
        FileRecord record = fileRecordRepository.findByShareCodeAndUserId(shareCode, userId)
                .orElseThrow(() -> new RuntimeException("File not found or unauthorized."));

        // Delete from S3
        amazonS3.deleteObject(bucketName, record.getS3ObjectKey());
        
        // Delete from PostgreSQL
        fileRecordRepository.delete(record);
    }

    public List<FileRecord> getUserFiles(Long userId) {
        return fileRecordRepository.findByUser_Id(userId);
    }
    
    /**
     * Uploads file for guest users (no user association).
     */
    public FileRecord uploadFileAsGuest(MultipartFile file, String guestId) throws IOException {
        String shareCode = generateUniqueShareCode();
        String s3ObjectKey = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());
        metadata.setContentType(file.getContentType());
        
        amazonS3.putObject(
            new PutObjectRequest(bucketName, s3ObjectKey, file.getInputStream(), metadata)
        );

        FileRecord record = new FileRecord();
        record.setShareCode(shareCode);
        record.setS3ObjectKey(s3ObjectKey);
        record.setOriginalFilename(file.getOriginalFilename());
        record.setUser(null); // No user for guest uploads
        
        return fileRecordRepository.save(record);
    }
}