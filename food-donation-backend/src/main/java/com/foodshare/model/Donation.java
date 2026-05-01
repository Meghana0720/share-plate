package com.foodshare.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@Document(collection = "donations")
@SuppressWarnings("SpellCheckingInspection")
public class Donation {
    @Id
    private String id;
    private String uniqueId;

    // Basic Food Info
    private String foodName;
    private String quantity;
    private Instant expiryTime;  // UTC timestamp
    private String foodType;
    private String foodCategory;
    private String storageCondition;
    private Integer approxServings;

    // Location Details
    private String address;
    private String pincode;
    private String landmark;
    private String city;
    private String phoneNumber;

    // Media
    private List<String> imageUrls;

    // Availability Timing - UTC timestamps
    private Instant availableFrom;
    private Instant availableUntil;

    // Donor Information
    private String donorName;
    private String donorEmail;
    private String donorType;

    // Additional Notes
    private String specialInstructions;

    private String status = "PENDING";

    // UTC timestamp for creation
    private Instant createdAt = Instant.now();

    // Auto-calculated expiration time (UTC)
    private Instant autoExpireAt;
}