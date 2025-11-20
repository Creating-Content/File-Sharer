package com.peerlink.fileSharer.controller;

import com.peerlink.fileSharer.model.FileRecord;
import com.peerlink.fileSharer.model.User;
import com.peerlink.fileSharer.repository.UserRepository;
import com.peerlink.fileSharer.service.FileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/files")
public class FileController {

    private final FileService fileService;
    private final UserRepository userRepository;
    
    // Inject services
    public FileController(FileService fileService, UserRepository userRepository) {
        this.fileService = fileService;
        this.userRepository = userRepository;
    }
    
    // Utility to get the full User entity from the principal
    private User getCurrentUser(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                             .orElseThrow(() -> new RuntimeException("User not found!"));
    }

    // --- 1. UPLOAD ENDPOINT (ANONYMOUS OR AUTHENTICATED) ---
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "guestId", required = false) String guestId,
        @AuthenticationPrincipal UserDetails userDetails
    ) throws IOException {
        
        // Check if user is logged in
        if (userDetails != null) {
            // Logged-in user flow
            User user = getCurrentUser(userDetails);
            FileRecord record = fileService.uploadFile(file, user);
            user.setTransferCount(user.getTransferCount() + 1);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("shareCode", record.getShareCode()));
        } else {
            // Guest user flow - upload without user association
            FileRecord record = fileService.uploadFileAsGuest(file, guestId);
            return ResponseEntity.ok(Map.of("shareCode", record.getShareCode()));
        }
    }

    // --- 2. PUBLIC DOWNLOAD ENDPOINT ---
    // Does NOT require authentication (permitAll in SecurityConfig)
    // Returns a temporary S3 redirect URL.
    @GetMapping("/download/{shareCode}")
    public ResponseEntity<Map<String, String>> downloadFile(@PathVariable String shareCode) {
        String s3Url = fileService.generateDownloadUrl(shareCode);
        
        if (s3Url == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("message", "File not found or expired.")
            );
        }
        
        // Client (Next.js) will redirect to this URL to start download from S3
        return ResponseEntity.ok(Map.of("redirectUrl", s3Url));
    }

    // --- 3. USER PROFILE: LIST FILES ---
    // Requires a logged-in user
    @GetMapping("/user/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<FileRecord>> getUserFiles(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        
        // Retrieve the list of files associated with this user from the DB
        List<FileRecord> fileRecords = fileService.getUserFiles(user.getId());
        
        return ResponseEntity.ok(fileRecords);
    }
    
    // --- 4. USER PROFILE: DELETE FILE ---
    // Requires a logged-in user
    @DeleteMapping("/user/delete/{shareCode}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> deleteFile(
        @PathVariable String shareCode,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = getCurrentUser(userDetails);
        
        try {
            // Deletes the file from S3 and the record from PostgreSQL
            fileService.deleteFile(shareCode, user.getId());
            return ResponseEntity.ok("File deleted successfully.");
        } catch (RuntimeException e) {
            // Handles "File not found or unauthorized." exception from FileService
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}