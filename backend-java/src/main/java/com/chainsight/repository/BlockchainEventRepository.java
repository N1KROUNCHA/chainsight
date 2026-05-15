package com.chainsight.repository;

import com.chainsight.model.BlockchainEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BlockchainEventRepository extends JpaRepository<BlockchainEvent, Long> {
    List<BlockchainEvent> findAllByOrderByTimestampDesc();
    List<BlockchainEvent> findByOrderIdOrderByTimestampAsc(Long orderId);
}
