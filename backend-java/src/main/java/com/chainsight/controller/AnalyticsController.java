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

    public AnalyticsController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping("/bottleneck")
    public Map<String, Object> getBottleneckAnalysis() {
        List<Order> allOrders = orderRepository.findAll();
        int total = allOrders.size();
        int pending = (int) allOrders.stream().filter(o -> "PENDING".equals(o.getOrderStatus())).count();
        int approved = (int) allOrders.stream().filter(o -> "APPROVED".equals(o.getOrderStatus())).count();
        int dispatched = (int) allOrders.stream().filter(o -> "DISPATCHED".equals(o.getOrderStatus())).count();
        int delivered = (int) allOrders.stream().filter(o -> "DELIVERED".equals(o.getOrderStatus())).count();

        // Simulate stage analysis based on real order distribution
        List<Map<String, Object>> stages = new ArrayList<>();
        stages.add(createStage("1", "Order Verification", 1.2, (double)pending/total, 95, pending > 5 ? "WARNING" : "OK"));
        stages.add(createStage("2", "Warehouse Picking", 4.5, (double)approved/total, 88, approved > 5 ? "CRITICAL" : "OK"));
        stages.add(createStage("3", "Carrier Dispatch", 2.1, (double)dispatched/total, 92, dispatched > 3 ? "WARNING" : "OK"));
        stages.add(createStage("4", "Last Mile Delivery", 12.4, 0.05, 84, "OK"));

        Map<String, Object> res = new HashMap<>();
        res.put("stages", stages);
        res.put("recentDelays", List.of(
            Map.of("shipmentId", "ORD-992", "stage", "Warehouse Picking", "delayHrs", 5, "ts", System.currentTimeMillis() - 3600000),
            Map.of("shipmentId", "ORD-881", "stage", "Carrier Dispatch", "delayHrs", 2, "ts", System.currentTimeMillis() - 7200000)
        ));
        return res;
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
