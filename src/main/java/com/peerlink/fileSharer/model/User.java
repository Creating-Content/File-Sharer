package com.peerlink.fileSharer.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data // Lombok: Generates getters, setters, toString, equals, and hashCode
@NoArgsConstructor // Lombok: Generates a constructor with no arguments
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Unique identifier for the user

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password; // Will store the hashed password

    @Column(name = "transfer_count")
    private Integer transferCount = 0; // Tracks the number of free transfers used

    @Column(nullable = false)
    private String role = "FREE_USER"; // Role for security (e.g., FREE_USER, PREMIUM)

    // Maps the one-to-many relationship with FileRecord
    // CascadeType.ALL means if a User is deleted, their associated files (metadata) are also handled.
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FileRecord> files = new ArrayList<>();
}