package com.chainsight.repository;

import com.chainsight.model.Distributor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DistributorRepository extends JpaRepository<Distributor, Long> {
    Optional<Distributor> findByUserUserId(Long userId);
}
