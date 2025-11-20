package com.peerlink.fileSharer.repository;

import com.peerlink.fileSharer.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// JpaRepository<EntityClass, PrimaryKeyType>
public interface UserRepository extends JpaRepository<User, Long> {

    // Custom method for Spring Security to find a user by their username during login.
    Optional<User> findByUsername(String username);
}