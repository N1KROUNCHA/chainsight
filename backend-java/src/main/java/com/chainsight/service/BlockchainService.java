package com.chainsight.service;

import com.chainsight.model.BlockchainEvent;
import com.chainsight.repository.BlockchainEventRepository;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.Uint;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.gas.DefaultGasProvider;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class BlockchainService {

    private final BlockchainEventRepository repository;
    private final String contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    private final String privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    
    private Web3j web3j;
    private Credentials credentials;
    private RawTransactionManager transactionManager;

    public BlockchainService(BlockchainEventRepository repository) {
        this.repository = repository;
        try {
            this.web3j = Web3j.build(new HttpService("http://localhost:8545"));
            this.credentials = Credentials.create(privateKey);
            this.transactionManager = new RawTransactionManager(web3j, credentials, 1337);
            System.out.println("✅ Connected to Hardhat Node (ChainID 1337)");
        } catch (Exception e) {
            System.err.println("❌ Failed to connect to Hardhat node: " + e.getMessage());
        }
    }

    public void logEvent(String eventType, String entityRole, Long entityId, Long orderId, String details) {
        String txHash = "0xPENDING";
        System.out.println("🚛 [BLOCKCHAIN] Processing Event: " + eventType + " for Order #" + orderId);

        try {
            if (web3j != null && transactionManager != null) {
                // Map Java Event to Solidity Enum
                int solidityEventType = 1; // Default to Delivery
                if ("DISPATCHED".equals(eventType)) solidityEventType = 0;
                else if ("DELIVERED".equals(eventType)) solidityEventType = 1;
                else if ("INVENTORY_UPDATE".equals(eventType)) solidityEventType = 2;
                else if ("DELAY".equals(eventType)) solidityEventType = 3;

                txHash = submitToBlockchain(solidityEventType, orderId != null ? orderId.toString() : "0", "N/A", details);
                System.out.println("⛓️ [ON-CHAIN SUCCESS] Hash: " + txHash);
            } else {
                txHash = "0xSIM_" + java.util.UUID.randomUUID().toString().substring(0, 8);
            }
        } catch (Exception e) {
            System.err.println("❌ [BLOCKCHAIN ERROR] Transaction Failed: " + e.getMessage());
            txHash = "0xERR_" + System.currentTimeMillis();
        }

        try {
            BlockchainEvent event = new BlockchainEvent(txHash, eventType, entityRole, entityId, orderId, details);
            repository.save(event);
        } catch (Exception e) {
            System.err.println("DEBUG: Failed to save event to DB: " + e.getMessage());
        }
    }

    private String submitToBlockchain(int type, String shipmentId, String sku, String metadata) throws Exception {
        // Call logSupplyChainEvent(EventType etype, string shipId, string sku, string metadata)
        Function function = new Function(
                "logSupplyChainEvent",
                Arrays.asList(
                    new org.web3j.abi.datatypes.generated.Uint8(type),
                    new org.web3j.abi.datatypes.Utf8String(shipmentId),
                    new org.web3j.abi.datatypes.Utf8String(sku),
                    new org.web3j.abi.datatypes.Utf8String(metadata)
                ),
                Collections.emptyList());

        String encodedFunction = FunctionEncoder.encode(function);
        
        org.web3j.protocol.core.methods.response.EthSendTransaction response = transactionManager.sendTransaction(
                DefaultGasProvider.GAS_PRICE,
                DefaultGasProvider.GAS_LIMIT,
                contractAddress,
                encodedFunction,
                BigInteger.ZERO);

        if (response.hasError()) {
            throw new RuntimeException(response.getError().getMessage());
        }

        return response.getTransactionHash();
    }

    public List<BlockchainEvent> getAllEvents() {
        return repository.findAllByOrderByTimestampDesc();
    }

    public List<BlockchainEvent> getEventsByOrderId(Long orderId) {
        return repository.findByOrderIdOrderByTimestampAsc(orderId);
    }
}
