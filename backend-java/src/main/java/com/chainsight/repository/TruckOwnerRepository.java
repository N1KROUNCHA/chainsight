package com.chainsight.repository;

import com.chainsight.model.TruckOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TruckOwnerRepository extends JpaRepository<TruckOwner, Long> {
    Optional<TruckOwner> findByUserUserId(Long userId);
}
