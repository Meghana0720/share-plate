package com.foodshare.service;

import com.foodshare.model.Donation;
import com.foodshare.model.Request;
import com.foodshare.repository.DonationRepository;
import com.foodshare.repository.RequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
@SuppressWarnings({"unused", "SpellCheckingInspection"})
public class DonationService {

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private RequestRepository requestRepository;

    public Donation createDonation(Donation donation) {
        String uniqueId = "DON" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        donation.setUniqueId(uniqueId);
        donation.setCreatedAt(Instant.now());
        donation.setStatus("PENDING");

        // Calculate auto-expire time
        calculateAndSetAutoExpire(donation);

        return donationRepository.save(donation);
    }

    private void calculateAndSetAutoExpire(Donation donation) {
        Instant now = Instant.now();
        Instant earliestExpiry = null;

        // 1. Food expiry (safety first) - highest priority
        if (donation.getExpiryTime() != null) {
            earliestExpiry = donation.getExpiryTime();
        }

        // 2. Pickup window closed + 1 hour buffer
        if (donation.getAvailableUntil() != null) {
            Instant pickupExpiry = donation.getAvailableUntil().plusSeconds(3600); // +1 hour
            if (earliestExpiry == null || pickupExpiry.isBefore(earliestExpiry)) {
                earliestExpiry = pickupExpiry;
            }
        }

        // 3. Maximum 24 hours from creation
        Instant maxAge = donation.getCreatedAt().plusSeconds(24 * 3600); // +24 hours
        if (earliestExpiry == null || maxAge.isBefore(earliestExpiry)) {
            earliestExpiry = maxAge;
        }

        donation.setAutoExpireAt(earliestExpiry);
    }

    public List<Donation> getDonationsByPincode(String pincode) {
        return donationRepository.findByPincodeAndStatus(pincode, "PENDING");
    }

    public List<Donation> searchDonations(String pincode, String foodType, String foodCategory, Integer minServings) {
        if (foodType != null && !foodType.isEmpty() || foodCategory != null && !foodCategory.isEmpty() || minServings != null) {
            return donationRepository.findAdvancedSearch(pincode, foodType, foodCategory, minServings);
        }
        return donationRepository.findByPincodeSimple(pincode);
    }

    public Request createRequest(Request request) {
        Donation donation = donationRepository.findById(request.getDonationId()).orElse(null);
        if (donation != null) {
            request.setDonorName(donation.getDonorName());
            request.setFoodName(donation.getFoodName());
        }

        String uniqueCode = "FDX" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        request.setUniqueCode(uniqueCode);
        return requestRepository.save(request);
    }

    public Request acceptRequest(String requestId) {
        Request request = requestRepository.findById(requestId).orElse(null);
        if (request != null) {
            request.setStatus("ACCEPTED");

            Donation donation = donationRepository.findById(request.getDonationId()).orElse(null);
            if (donation != null) {
                donation.setStatus("ACCEPTED");
                // When accepted, set to expire in 12 hours (for pickup completion)
                donation.setAutoExpireAt(Instant.now().plusSeconds(12 * 3600));
                donationRepository.save(donation);
            }

            return requestRepository.save(request);
        }
        return null;
    }

    public void rejectRequest(String requestId) {
        requestRepository.deleteById(requestId);
    }

    public boolean confirmPickup(String uniqueCode) {
        Request request = requestRepository.findByUniqueCode(uniqueCode);
        if (request != null && "ACCEPTED".equals(request.getStatus())) {
            donationRepository.deleteById(request.getDonationId());
            requestRepository.delete(request);
            return true;
        }
        return false;
    }

    public List<Request> getRequestsByDonor(String donorName) {
        return requestRepository.findByDonorName(donorName);
    }

    public List<Request> getAcceptedRequestsByDonor(String donorName) {
        return requestRepository.findByDonorNameAndStatus(donorName, "ACCEPTED");
    }

    // AUTO EXPIRE SYSTEM - Runs every 5 minutes
    @Scheduled(fixedRate = 300000)
    public void autoExpireDonations() {
        Instant now = Instant.now();

        // Find donations that should auto-expire
        List<Donation> expiredDonations = donationRepository.findByAutoExpireAtBefore(now);

        int expiredCount = expiredDonations.size();

        for (Donation donation : expiredDonations) {
            // Determine reason for logging
            String reason = getExpiryReason(donation, now);
            System.out.println("Auto-expiring donation " + donation.getUniqueId() +
                    " - Reason: " + reason);

            // Delete associated requests
            List<Request> requests = requestRepository.findByDonationId(donation.getId());
            requestRepository.deleteAll(requests);

            // Delete donation
            donationRepository.delete(donation);
        }

        if (expiredCount > 0) {
            System.out.println("✓ Auto-expired " + expiredCount + " donation(s) at " +
                    LocalDateTime.ofInstant(now, ZoneId.systemDefault()));
        }
    }

    private String getExpiryReason(Donation donation, Instant now) {
        if (donation.getExpiryTime() != null && donation.getExpiryTime().isBefore(now)) {
            return "Food safety expiry reached";
        }

        if (donation.getAvailableUntil() != null &&
                donation.getAvailableUntil().plusSeconds(3600).isBefore(now)) {
            return "Pickup window closed (with 1h buffer)";
        }

        if (donation.getCreatedAt().plusSeconds(24 * 3600).isBefore(now)) {
            return "Maximum age reached (24h)";
        }

        if ("ACCEPTED".equals(donation.getStatus()) &&
                donation.getAutoExpireAt() != null &&
                donation.getAutoExpireAt().isBefore(now)) {
            return "Accepted donation pickup timeout (12h)";
        }

        return "Auto-expired by system";
    }
}