package com.chainsight.service;

import com.chainsight.model.BlockchainEvent;
import com.chainsight.repository.BlockchainEventRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class BlockchainService {

    private final BlockchainEventRepository repository;

    public BlockchainService(BlockchainEventRepository repository) {
        this.repository = repository;
    }

    public void logEvent(String eventType, String entityRole, Long entityId, String details) {
        String txHash = "0x" + UUID.randomUUID().toString().replace("-", "").substring(0, 40);
        BlockchainEvent event = new BlockchainEvent(txHash, eventType, entityRole, entityId, details);
        repository.save(event);
        System.out.println("🔗 Blockchain Event Logged: " + eventType + " | Tx: " + txHash);
    }

    public List<BlockchainEvent> getAllEvents() {
        return repository.findAllByOrderByTimestampDesc();
    }
}
