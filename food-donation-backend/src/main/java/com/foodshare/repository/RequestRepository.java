package com.foodshare.repository;

import com.foodshare.model.Request;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

@SuppressWarnings("unused") // Single annotation suppresses all warnings
public interface RequestRepository extends MongoRepository<Request, String> {
    List<Request> findByDonationId(String donationId);
    List<Request> findByStatus(String status); // Useful for future features
    List<Request> findByDonorName(String donorName);
    List<Request> findByDonorNameAndStatus(String donorName, String status);
    Request findByUniqueCode(String uniqueCode);
    List<Request> findByReceiverContact(String receiverContact); // Useful for receiver history
}