package com.chainsight.controller;

import com.chainsight.model.BlockchainEvent;
import com.chainsight.service.BlockchainService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/blockchain")
@CrossOrigin(origins = "*")
public class BlockchainController {

    private final BlockchainService blockchainService;

    public BlockchainController(BlockchainService blockchainService) {
        this.blockchainService = blockchainService;
    }

    @GetMapping("/events")
    public List<BlockchainEvent> getEvents() {
        return blockchainService.getAllEvents();
    }

    @GetMapping("/order/{orderId}")
    public List<BlockchainEvent> getEventsByOrderId(@PathVariable Long orderId) {
        return blockchainService.getEventsByOrderId(orderId);
    }
}
