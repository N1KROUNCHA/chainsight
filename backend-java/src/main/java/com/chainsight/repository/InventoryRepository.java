package com.chainsight.repository;

import com.chainsight.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    List<Inventory> findByOwnerTypeAndOwnerId(String ownerType, Long ownerId);
}
