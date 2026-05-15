package com.chainsight.repository;

import com.chainsight.model.UserReputation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserReputationRepository extends JpaRepository<UserReputation, Long> {
    Optional<UserReputation> findByUserUserId(Long userId);
}
