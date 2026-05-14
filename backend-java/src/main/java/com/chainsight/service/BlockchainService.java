package com.chainsight.service;

import com.chainsight.model.BlockchainEvent;
import com.chainsight.repository.BlockchainEventRepository;
import org.springframework.stereotype.Service;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import java.util.List;
import java.util.UUID;

@Service
public class BlockchainService {

    private final BlockchainEventRepository repository;
    private final String contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    private Web3j web3j;

    public BlockchainService(BlockchainEventRepository repository) {
        this.repository = repository;
        // Connect to local node if available, else null
        try {
            this.web3j = Web3j.build(new HttpService("http://localhost:8545"));
        } catch (Exception e) {
            this.web3j = null;
        }
    }

    public void logEvent(String eventType, String entityRole, Long entityId, Long orderId, String details) {
        // 1. Immutable Hash Generation (Simulating EVM Transaction)
        String txHash = "0x" + UUID.randomUUID().toString().replace("-", "");
        
        // 2. Solidity Integration Point:
        // In a real production environment, we would call:
        // supplyChainContract.createShipment(...) or _logEvent(...)
        // Since we are in dev, we log to our 'Sidechain' (PostgreSQL) for persistence
        
        BlockchainEvent event = new BlockchainEvent(txHash, eventType, entityRole, entityId, orderId, details);
        repository.save(event);
        
        System.out.println("🔗 [SOLIDITY MIRROR] Event Logged to Contract @ " + contractAddress);
        System.out.println("🔗 Event Type: " + eventType + " | Tx: " + txHash);
    }

    public List<BlockchainEvent> getAllEvents() {
        return repository.findAllByOrderByTimestampDesc();
    }
}
