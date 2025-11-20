package com.peerlink.fileSharer.repository;

import com.peerlink.fileSharer.model.FileRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FileRecordRepository extends JpaRepository<FileRecord, Long> {

    // Find a file record using the unique share code (like the old port number)
    Optional<FileRecord> findByShareCode(String shareCode);

    // Find all file records uploaded by a specific user (for the profile/history page)
    List<FileRecord> findByUser_Id(Long userId);

    // Find a file record by both the share code AND the user ID (for security/deletion)
    Optional<FileRecord> findByShareCodeAndUserId(String shareCode, Long userId);
}