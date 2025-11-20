package com.peerlink.fileSharer.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "file_records")
@Data // Lombok: Generates getters, setters, etc.
@NoArgsConstructor // Lombok: Generates a no-argument constructor
public class FileRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Primary key for the file record

    @Column(unique = true, nullable = false)
    private String shareCode; // The unique code (like the old port number) shared with peers

    @Column(nullable = false)
    private String originalFilename; // The file name provided by the user

    @Column(nullable = false)
    private String s3ObjectKey; // The unique identifier/path in the AWS S3 bucket

    @Column(name = "upload_date")
    private Instant uploadDate = Instant.now(); // Timestamp of when the file was uploaded

    @Column(name = "download_count")
    private Long downloadCount = 0L; // Tracks how many times the file has been downloaded

    // Many files belong to one user (Foreign Key relationship)
    // Nullable for guest uploads
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    @JsonIgnore
    private User user;
}