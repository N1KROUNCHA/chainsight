package com.chainsight.repository;

import com.chainsight.model.Retailer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RetailerRepository extends JpaRepository<Retailer, Long> {
    Optional<Retailer> findByUserUserId(Long userId);
}
