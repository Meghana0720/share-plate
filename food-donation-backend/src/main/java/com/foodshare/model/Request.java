package com.foodshare.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Document(collection = "requests")
@SuppressWarnings("SpellCheckingInspection")
public class Request {
    @Id
    private String id;
    private String donationId;
    private String receiverName;
    private String purpose;
    private String receiverContact;
    private String pincode;


    private String status = "PENDING";
    private LocalDateTime requestedAt = LocalDateTime.now();

    private String uniqueCode;
    private String foodName;
    private String donorName;


}