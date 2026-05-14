package com.chainsight.repository;

import com.chainsight.model.Truck;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TruckRepository extends JpaRepository<Truck, Long> {
    List<Truck> findByOwnerUserUserId(Long userId);
    List<Truck> findByOwnerOwnerId(Long ownerId);
}
