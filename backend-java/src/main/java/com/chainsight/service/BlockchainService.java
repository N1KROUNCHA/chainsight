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
    private final String contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
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
        } catch (Exception e) {
            System.err.println("Failed to connect to Hardhat node: " + e.getMessage());
        }
    }

    public void logEvent(String eventType, String entityRole, Long entityId, Long orderId, String details) {
        String txHash = "0xPENDING_" + System.currentTimeMillis();
        System.out.println("DEBUG: Logging event " + eventType + " for order " + orderId);

        try {
            if (web3j != null && transactionManager != null) {
                System.out.println("DEBUG: Attempting on-chain transaction for " + eventType);
                txHash = submitToBlockchain(eventType, details);
                System.out.println("DEBUG: On-chain success. Hash: " + txHash);
            } else {
                System.out.println("DEBUG: Skipping on-chain (Web3j or TxManager is null)");
                txHash = "0xSIM_" + java.util.UUID.randomUUID().toString().substring(0, 8);
            }
        } catch (Exception e) {
            System.err.println("DEBUG: Blockchain Transaction Failed: " + e.getMessage());
            e.printStackTrace();
            txHash = "0xERR_" + System.currentTimeMillis();
        }

        try {
            BlockchainEvent event = new BlockchainEvent(txHash, eventType, entityRole, entityId, orderId, details);
            repository.save(event);
            System.out.println("🔗 [EVENT RECORDED] Type: " + eventType + " | Tx: " + txHash);
        } catch (Exception e) {
            System.err.println("DEBUG: Failed to save event to DB: " + e.getMessage());
        }
    }

    private String submitToBlockchain(String type, String data) throws Exception {
        // Create a basic transaction to the contract to record activity
        Function function = new Function(
                "setActorAuthorization",
                Arrays.asList(new Address(credentials.getAddress()), new org.web3j.abi.datatypes.Bool(true)),
                Collections.emptyList());

        String encodedFunction = FunctionEncoder.encode(function);
        
        org.web3j.protocol.core.methods.response.EthSendTransaction response = transactionManager.sendTransaction(
                DefaultGasProvider.GAS_PRICE,
                DefaultGasProvider.GAS_LIMIT,
                contractAddress,
                encodedFunction,
                BigInteger.ZERO);

        if (response.hasError()) {
            throw new RuntimeException("Blockchain Error: " + response.getError().getMessage());
        }

        return response.getTransactionHash();
    }

    public List<BlockchainEvent> getAllEvents() {
        return repository.findAllByOrderByTimestampDesc();
    }
}
