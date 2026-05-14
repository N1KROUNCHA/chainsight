package com.chainsight.controller;

import com.chainsight.model.Order;
import com.chainsight.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        return ResponseEntity.ok(orderService.createOrder(order));
    }

    @GetMapping("/retailer/{id}")
    public ResponseEntity<List<Order>> getRetailerOrders(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getRetailerOrders(id));
    }

    @GetMapping("/distributor/{id}")
    public ResponseEntity<List<Order>> getDistributorOrders(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getDistributorOrders(id));
    }

    @GetMapping("/supplier/{id}")
    public ResponseEntity<List<Order>> getSupplierOrders(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getSupplierOrders(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestBody String status) {
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }
}
