package com.chainsight.service;

import com.chainsight.model.*;
import com.chainsight.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final RetailerRepository retailerRepository;
    private final DistributorRepository distributorRepository;
    private final SupplierRepository supplierRepository;
    private final TruckRepository truckRepository;
    private final TruckOwnerRepository truckOwnerRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final BlockchainService blockchainService;

    public OrderService(OrderRepository orderRepository, 
                        RetailerRepository retailerRepository,
                        DistributorRepository distributorRepository,
                        SupplierRepository supplierRepository,
                        TruckRepository truckRepository,
                        TruckOwnerRepository truckOwnerRepository,
                        ProductRepository productRepository,
                        InventoryService inventoryService,
                        BlockchainService blockchainService) {
        this.orderRepository = orderRepository;
        this.retailerRepository = retailerRepository;
        this.distributorRepository = distributorRepository;
        this.supplierRepository = supplierRepository;
        this.truckRepository = truckRepository;
        this.truckOwnerRepository = truckOwnerRepository;
        this.productRepository = productRepository;
        this.inventoryService = inventoryService;
        this.blockchainService = blockchainService;
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
            order.getItems().forEach(item -> {
                item.setOrder(order);
                if (item.getProduct() != null && item.getProduct().getProductId() != null) {
                    Product p = productRepository.findById(item.getProduct().getProductId()).orElse(null);
                    if (p != null) item.setProduct(p);
                }
            });
        }

        try {
            Order saved = orderRepository.save(order);
            
            // Log to Blockchain: Initial Order Creation
            try {
                String buyerRole = saved.getRetailer() != null ? "RETAILER" : "DISTRIBUTOR";
                Long buyerUserId = (saved.getRetailer() != null) ? saved.getRetailer().getUser().getUserId() : saved.getDistributor().getUser().getUserId();
                String details = "Order #" + saved.getOrderId() + " initiated by " + (saved.getRetailer() != null ? "Retailer" : "Distributor");
                blockchainService.logEvent("ORDER_CREATED", buyerRole, buyerUserId, saved.getOrderId(), details);
            } catch (Exception e) { /* log and continue */ }

            return saved;
        } catch (Exception e) {
            throw e;
        }
    }

    public List<Order> getRetailerOrders(Long userId) {
        return orderRepository.findByRetailerUserUserId(userId);
    }

    public List<Order> getDistributorInboundOrders(Long userId) {
        return orderRepository.findByDistributorUserUserIdAndRetailerNotNull(userId);
    }

    public List<Order> getDistributorOutboundOrders(Long userId) {
        return orderRepository.findByDistributorUserUserIdAndSupplierNotNullAndRetailerIsNull(userId);
    }

    public List<Order> getSupplierOrders(Long userId) {
        return orderRepository.findBySupplierUserUserId(userId);
    }

    public Order updateStatus(Long orderId, String status, BigDecimal weight) {
        String cleanStatus = status.replace("\"", "").trim();
        Order order = orderRepository.findById(orderId).orElseThrow();
        String oldStatus = order.getOrderStatus();
        
        // Logic for inventory movement on status changes
        if ("DELIVERED".equals(cleanStatus) && !"DELIVERED".equals(oldStatus)) {
            // ... (inventory logic)
            Long buyerId = order.getRetailer() != null ? order.getRetailer().getUser().getUserId() : order.getDistributor().getUser().getUserId();
            String buyerType = order.getRetailer() != null ? "RETAILER" : "DISTRIBUTOR";
            
            if (order.getItems() != null) {
                for (com.chainsight.model.OrderItem item : order.getItems()) {
                    inventoryService.adjustStock(buyerType, buyerId, item.getProduct().getProductId(), item.getQuantity());
                }
            }
            blockchainService.logEvent("DELIVERED", buyerType, buyerId, order.getOrderId(), "Order #" + order.getOrderId() + " confirmed received.");
        }

        order.setOrderStatus(cleanStatus);
        if (weight != null) order.setWeightTons(weight);
        
        Order saved = orderRepository.save(order);
        
        // Log status change touchpoint
        blockchainService.logEvent("STATUS_UPDATE", "SYSTEM", 0L, orderId, "Order #" + orderId + " moved from " + oldStatus + " to " + cleanStatus);
        
        return saved;
    }

    public List<Order> getOpenShipmentRequests(Long transporterUserId) {
        if (transporterUserId != null) {
            List<Order> targeted = orderRepository.findByTargetTransporterUserUserIdAndAssignedTruckIsNull(transporterUserId);
            List<Order> general = orderRepository.findByOrderStatus("APPROVED");
            targeted.addAll(general.stream().filter(o -> o.getTargetTransporter() == null).toList());
            return targeted;
        }
        return orderRepository.findByOrderStatus("APPROVED");
    }

    public List<com.chainsight.model.TruckOwner> getAllTransporters() {
        return truckOwnerRepository.findAll();
    }

    public List<Order> getActiveJobs(Long truckOwnerUserId) {
        return orderRepository.findByAssignedTruckOwnerUserUserIdAndOrderStatusIn(truckOwnerUserId, List.of("DISPATCHED", "IN_TRANSIT", "APPROVED", "DELIVERED"));
    }

    public Order assignTransporter(Long orderId, Long transporterUserId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        com.chainsight.model.TruckOwner owner = truckOwnerRepository.findByUserUserId(transporterUserId).orElseThrow();
        order.setTargetTransporter(owner);
        order.setOrderStatus("APPROVED");
        
        Order saved = orderRepository.save(order);
        blockchainService.logEvent("TRANSPORTER_ASSIGNED", "DISTRIBUTOR", 0L, orderId, "Order #" + orderId + " assigned to Transporter: " + owner.getCompanyName());
        return saved;
    }

    public Order assignTruckToOrder(Long orderId, Long truckId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        Truck truck = truckRepository.findById(truckId).orElseThrow();
        
        // ... (capacity logic)
        System.out.println("🚛 Attempting to assign Truck: " + truck.getTruckNumber());
        System.out.println("🚛 Truck Available Capacity: " + truck.getAvailableCapacityTons());
        System.out.println("🚛 Order Weight: " + order.getWeightTons());

        if (order.getWeightTons() != null && truck.getAvailableCapacityTons() != null) {
            BigDecimal remaining = truck.getAvailableCapacityTons().subtract(order.getWeightTons());
            System.out.println("🚛 Remaining after subtraction: " + remaining);
            if (remaining.compareTo(BigDecimal.ZERO) < 0) {
                System.err.println("❌ ERROR: Truck capacity exceeded! Needs " + order.getWeightTons() + "T, has " + truck.getAvailableCapacityTons() + "T");
                throw new RuntimeException("Truck capacity exceeded! Needs " + order.getWeightTons() + "T, but only " + truck.getAvailableCapacityTons() + "T available.");
            }
            truck.setAvailableCapacityTons(remaining);
            truck.setAvailabilityStatus(remaining.compareTo(BigDecimal.ZERO) == 0 ? "FULL" : "PARTIAL_LOAD");
            truckRepository.save(truck);
        }
        
        // Inventory movement on Dispatch
        Long sellerId = order.getSupplier() != null ? order.getSupplier().getUser().getUserId() : order.getDistributor().getUser().getUserId();
        String sellerType = order.getSupplier() != null ? "SUPPLIER" : "DISTRIBUTOR";
        
        if (order.getItems() != null) {
            for (com.chainsight.model.OrderItem item : order.getItems()) {
                inventoryService.adjustStock(sellerType, sellerId, item.getProduct().getProductId(), -item.getQuantity());
            }
        }

        order.setAssignedTruck(truck);
        order.setOrderStatus("DISPATCHED");
        Order saved = orderRepository.save(order);
        
        blockchainService.logEvent("DISPATCHED", "TRUCK_OWNER", truck.getOwner().getUser().getUserId(), orderId, 
            "Order #" + orderId + " loaded on Truck " + truck.getTruckNumber() + " (" + truck.getOwner().getCompanyName() + ")");
            
        return saved;
    }
}
