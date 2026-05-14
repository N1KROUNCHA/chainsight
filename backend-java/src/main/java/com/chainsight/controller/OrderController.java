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

    @GetMapping("/distributor/{id}/inbound")
    public ResponseEntity<List<Order>> getDistributorInboundOrders(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getDistributorInboundOrders(id));
    }

    @GetMapping("/distributor/{id}/outbound")
    public ResponseEntity<List<Order>> getDistributorOutboundOrders(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getDistributorOutboundOrders(id));
    }

    @GetMapping("/supplier/{id}")
    public ResponseEntity<List<Order>> getSupplierOrders(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getSupplierOrders(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Order> updateStatus(
            @PathVariable Long id, 
            @RequestBody String status,
            @RequestParam(required = false) java.math.BigDecimal weight) {
        return ResponseEntity.ok(orderService.updateStatus(id, status, weight));
    }

    @GetMapping("/open-requests")
    public ResponseEntity<List<Order>> getOpenShipmentRequests(@RequestParam(required = false) Long transporterUserId) {
        return ResponseEntity.ok(orderService.getOpenShipmentRequests(transporterUserId));
    }

    @GetMapping("/transporters")
    public ResponseEntity<List<com.chainsight.model.TruckOwner>> getAllTransporters() {
        return ResponseEntity.ok(orderService.getAllTransporters());
    }

    @PatchMapping("/{orderId}/assign-transporter/{userId}")
    public ResponseEntity<Order> assignTransporter(@PathVariable Long orderId, @PathVariable Long userId) {
        return ResponseEntity.ok(orderService.assignTransporter(orderId, userId));
    }

    @GetMapping("/truck-owner/{userId}/active-jobs")
    public ResponseEntity<List<Order>> getActiveJobs(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getActiveJobs(userId));
    }

    @PatchMapping("/{orderId}/assign-truck/{truckId}")
    public ResponseEntity<Order> assignTruckToOrder(@PathVariable Long orderId, @PathVariable Long truckId) {
        try {
            return ResponseEntity.ok(orderService.assignTruckToOrder(orderId, truckId));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
