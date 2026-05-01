package com.foodshare.controller;

import com.foodshare.model.Donation;
import com.foodshare.model.Request;
import com.foodshare.service.DonationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/donations")
// @CrossOrigin(origins = "http://localhost:5173") ← REMOVE THIS LINE
@SuppressWarnings("unused")
public class DonationController {

    @Autowired
    @SuppressWarnings("unused")
    private DonationService donationService;

    @PostMapping
    @SuppressWarnings("unused")
    public ResponseEntity<Donation> createDonation(@RequestBody Donation donation) {
        return ResponseEntity.ok(donationService.createDonation(donation));
    }

    @GetMapping("/search")
    @SuppressWarnings("SpellCheckingInspection")
    public ResponseEntity<List<Donation>> searchDonations(
            @RequestParam String pincode,
            @RequestParam(required = false) String foodType,
            @RequestParam(required = false) String foodCategory,
            @RequestParam(required = false) Integer minServings) {
        return ResponseEntity.ok(donationService.searchDonations(pincode, foodType, foodCategory, minServings));
    }

    @PostMapping("/request")
    public ResponseEntity<Request> createRequest(@RequestBody Request request) {
        return ResponseEntity.ok(donationService.createRequest(request));
    }

    @PutMapping("/request/{requestId}/accept")
    public ResponseEntity<Request> acceptRequest(@PathVariable String requestId) {
        Request request = donationService.acceptRequest(requestId);
        return request != null ? ResponseEntity.ok(request) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/request/{requestId}")
    public ResponseEntity<?> rejectRequest(@PathVariable String requestId) {
        donationService.rejectRequest(requestId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/confirm-pickup")
    public ResponseEntity<?> confirmPickup(@RequestParam String uniqueCode) {
        boolean success = donationService.confirmPickup(uniqueCode);
        return success ? ResponseEntity.ok().build() : ResponseEntity.badRequest().body("Invalid code");
    }
}