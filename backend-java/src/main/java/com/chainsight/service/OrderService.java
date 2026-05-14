package com.chainsight.service;

import com.chainsight.model.Order;
import com.chainsight.model.Retailer;
import com.chainsight.model.Distributor;
import com.chainsight.model.Supplier;
import com.chainsight.repository.OrderRepository;
import com.chainsight.repository.RetailerRepository;
import com.chainsight.repository.DistributorRepository;
import com.chainsight.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final RetailerRepository retailerRepository;
    private final DistributorRepository distributorRepository;
    private final SupplierRepository supplierRepository;

    public OrderService(OrderRepository orderRepository, 
                        RetailerRepository retailerRepository,
                        DistributorRepository distributorRepository,
                        SupplierRepository supplierRepository) {
        this.orderRepository = orderRepository;
        this.retailerRepository = retailerRepository;
        this.distributorRepository = distributorRepository;
        this.supplierRepository = supplierRepository;
    }

    public Order createOrder(Order order) {
        System.out.println("Creating order for User ID: " + (order.getRetailer() != null && order.getRetailer().getUser() != null ? order.getRetailer().getUser().getUserId() : "NULL"));
        
        // Resolve entities from User IDs
        if (order.getRetailer() != null && order.getRetailer().getUser() != null) {
            Retailer r = retailerRepository.findByUserUserId(order.getRetailer().getUser().getUserId()).orElse(null);
            if (r == null) throw new RuntimeException("Retailer not found for User ID: " + order.getRetailer().getUser().getUserId());
            order.setRetailer(r);
        }
        if (order.getDistributor() != null && order.getDistributor().getUser() != null) {
            Distributor d = distributorRepository.findByUserUserId(order.getDistributor().getUser().getUserId()).orElse(null);
            if (d == null) throw new RuntimeException("Distributor not found for User ID: " + order.getDistributor().getUser().getUserId());
            order.setDistributor(d);
        }
        if (order.getSupplier() != null && order.getSupplier().getUser() != null) {
            Supplier s = supplierRepository.findByUserUserId(order.getSupplier().getUser().getUserId()).orElse(null);
            if (s == null) throw new RuntimeException("Supplier not found for User ID: " + order.getSupplier().getUser().getUserId());
            order.setSupplier(s);
        }

        order.setOrderStatus("PENDING");
        if (order.getItems() != null) {
            order.getItems().forEach(item -> item.setOrder(order));
        }
        Order saved = orderRepository.save(order);
        System.out.println("Order saved successfully with ID: " + saved.getOrderId());
        return saved;
    }

    public List<Order> getRetailerOrders(Long userId) {
        return orderRepository.findByRetailerUserUserId(userId);
    }

    public List<Order> getDistributorOrders(Long userId) {
        return orderRepository.findByDistributorUserUserId(userId);
    }

    public List<Order> getSupplierOrders(Long userId) {
        return orderRepository.findBySupplierUserUserId(userId);
    }

    public Order updateStatus(Long orderId, String status) {
        // Trim quotes if sent as JSON string
        String cleanStatus = status.replace("\"", "").trim();
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setOrderStatus(cleanStatus);
        return orderRepository.save(order);
    }
}
