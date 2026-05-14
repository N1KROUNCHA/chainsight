package com.chainsight.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blockchain_events")
public class BlockchainEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String txHash;
    private String eventType; // ORDER_CREATED, DISPATCHED, DELIVERED
    private String entityRole; // RETAILER, DISTRIBUTOR, SUPPLIER
    private Long entityId;
    private Long orderId; // Linked order
    private String details;
    private LocalDateTime timestamp = LocalDateTime.now();

    public BlockchainEvent() {}

    public BlockchainEvent(String txHash, String eventType, String entityRole, Long entityId, Long orderId, String details) {
        this.txHash = txHash;
        this.eventType = eventType;
        this.entityRole = entityRole;
        this.entityId = entityId;
        this.orderId = orderId;
        this.details = details;
    }

    public Long getId() { return id; }
    public String getTxHash() { return txHash; }
    public String getEventType() { return eventType; }
    public String getEntityRole() { return entityRole; }
    public Long getEntityId() { return entityId; }
    public Long getOrderId() { return orderId; }
    public String getDetails() { return details; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
