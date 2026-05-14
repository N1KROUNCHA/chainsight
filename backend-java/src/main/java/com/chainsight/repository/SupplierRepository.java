package com.chainsight.repository;

import com.chainsight.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findByUserUserId(Long userId);
}
