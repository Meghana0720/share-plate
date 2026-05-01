package com.foodshare.repository;

import com.foodshare.model.Donation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.time.Instant;
import java.util.List;

@SuppressWarnings({"unused", "SpellCheckingInspection"})
public interface DonationRepository extends MongoRepository<Donation, String> {
    List<Donation> findByPincodeAndStatus(String pincode, String status);
    List<Donation> findByStatus(String status);
    List<Donation> findByDonorName(String donorName);

    // NEW: Find donations that should auto-expire
    List<Donation> findByAutoExpireAtBefore(Instant dateTime);

    // Find expiring soon (for notifications)
    @Query("{'autoExpireAt': {$gt: ?0, $lt: ?1}, 'status': 'PENDING'}")
    List<Donation> findExpiringSoon(Instant from, Instant to);

    @Query("{'pincode': ?0, 'status': 'PENDING', $or: [{'foodType': ?1}, {'foodCategory': ?2}, {'approxServings': {$gte: ?3}}]}")
    List<Donation> findAdvancedSearch(String pincode, String foodType, String foodCategory, Integer minServings);

    @Query("{'pincode': ?0, 'status': 'PENDING'}")
    List<Donation> findByPincodeSimple(String pincode);
}