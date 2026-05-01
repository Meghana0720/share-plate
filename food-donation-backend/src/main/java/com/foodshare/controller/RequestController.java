package com.foodshare.controller;

import com.foodshare.model.Request;
import com.foodshare.service.DonationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/requests")
@SuppressWarnings("unused")
public class RequestController {

    @Autowired
    @SuppressWarnings("unused")
    private DonationService donationService;

    @GetMapping("/donor/{donorName}")
    @SuppressWarnings("unused")
    public List<Request> getRequestsByDonor(@PathVariable String donorName) {
        return donationService.getRequestsByDonor(donorName);
    }

    @GetMapping("/accepted/{donorName}")
    @SuppressWarnings("unused")
    public List<Request> getAcceptedRequestsByDonor(@PathVariable String donorName) {
        return donationService.getAcceptedRequestsByDonor(donorName);
    }
}