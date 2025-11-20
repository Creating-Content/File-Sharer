package com.peerlink.fileSharer.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    // IMPORTANT: This allows your frontend (running on 3000) to communicate with your backend (running on 8080).
    private static final String FRONTEND_ORIGIN = "http://localhost:3000";

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Apply to all endpoints
            .allowedOrigins(FRONTEND_ORIGIN) // Allow requests from the Next.js dev server
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allow all common methods
            .allowedHeaders("*") // Allow all headers
            .allowCredentials(true); // VERY IMPORTANT for sending session cookies or tokens
    }
}