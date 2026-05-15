package com.chainsight.controller;

import org.springframework.web.bind.annotation.*;
import com.chainsight.repository.OrderRepository;
import com.chainsight.model.Order;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final OrderRepository orderRepository;
    private final com.chainsight.service.BlockchainService blockchainService;
    private final com.chainsight.service.AnalyticsService analyticsService;

    public AnalyticsController(OrderRepository orderRepository, 
                               com.chainsight.service.BlockchainService blockchainService,
                               com.chainsight.service.AnalyticsService analyticsService) {
        this.orderRepository = orderRepository;
        this.blockchainService = blockchainService;
        this.analyticsService = analyticsService;
    }

    @GetMapping("/blockchain")
    public Map<String, Object> getBlockchainData() {
        List<com.chainsight.model.BlockchainEvent> events = blockchainService.getAllEvents();
        return Map.of(
            "contractAddress", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
            "chainId", 1337,
            "totalEvents", events.size(),
            "events", events
        );
    }

    @GetMapping("/bottleneck")
    public Map<String, Object> getBottleneckAnalysis() {
        return analyticsService.calculateBottlenecks();
    }

    @GetMapping("/forecast")
    public Map<String, Object> getForecast() {
        Map<String, Object> res = new HashMap<>();
        res.put("summary", Map.of("growth", "+12.4%", "accuracy", "94%"));
        res.put("predictions", List.of(
            Map.of("id", "F1", "product", "Organic Wheat", "current", 1200, "predicted", 1450, "confidence", 0.92, "trend", "UP"),
            Map.of("id", "F2", "product", "Industrial Steel", "current", 800, "predicted", 750, "confidence", 0.88, "trend", "DOWN"),
            Map.of("id", "F3", "product", "Sanitizer Bulk", "current", 500, "predicted", 900, "confidence", 0.95, "trend", "UP")
        ));
        return res;
    }

    private Map<String, Object> createStage(String id, String name, double avg, double delay, int throughput, String status) {
        Map<String, Object> s = new HashMap<>();
        s.put("id", id);
        s.put("stage", name);
        s.put("avgProcessingHrs", avg);
        s.put("delayRate", delay);
        s.put("throughput", throughput);
        s.put("status", status);
        s.put("score", (int)(delay * 50 + (100 - throughput) * 0.5));
        return s;
    }
}
