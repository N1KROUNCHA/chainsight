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
            System.out.println("✅ Order saved successfully with ID: " + saved.getOrderId());
            
            // Log to Blockchain
            try {
                String buyerRole = saved.getRetailer() != null ? "RETAILER" : "DISTRIBUTOR";
                Long buyerUserId = 0L;
                if (saved.getRetailer() != null && saved.getRetailer().getUser() != null) {
                    buyerUserId = saved.getRetailer().getUser().getUserId();
                } else if (saved.getDistributor() != null && saved.getDistributor().getUser() != null) {
                    buyerUserId = saved.getDistributor().getUser().getUserId();
                }
                
                blockchainService.logEvent("ORDER_CREATED", buyerRole, buyerUserId, 
                    "Order #" + saved.getOrderId() + " placed with " + (saved.getSupplier() != null ? "Supplier" : "Distributor"));
            } catch (Exception be) {
                System.err.println("⚠️ Blockchain logging failed but order was saved: " + be.getMessage());
            }

            return saved;
        } catch (Exception e) {
            System.err.println("❌ Failed to save order: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public List<Order> getRetailerOrders(Long userId) {
        return orderRepository.findByRetailerUserUserId(userId);
    }

    // Inbound: Retailers ordering FROM Distributor
    public List<Order> getDistributorInboundOrders(Long userId) {
        return orderRepository.findByDistributorUserUserIdAndRetailerNotNull(userId);
    }

    // Outbound: Distributor ordering FROM Supplier
    public List<Order> getDistributorOutboundOrders(Long userId) {
        return orderRepository.findByDistributorUserUserIdAndSupplierNotNullAndRetailerIsNull(userId);
    }

    public List<Order> getSupplierOrders(Long userId) {
        return orderRepository.findBySupplierUserUserId(userId);
    }

    public Order updateStatus(Long orderId, String status, BigDecimal weight) {
        String cleanStatus = status.replace("\"", "").trim();
        Order order = orderRepository.findById(orderId).orElseThrow();
        
        // If transitioning TO Delivered, free up truck capacity AND add stock to buyer
        if ("DELIVERED".equals(cleanStatus) && !"DELIVERED".equals(order.getOrderStatus())) {
            // 1. Free Truck Capacity
            if (order.getAssignedTruck() != null) {
                Truck truck = order.getAssignedTruck();
                BigDecimal weightToFree = order.getWeightTons() != null ? order.getWeightTons() : BigDecimal.ZERO;
                truck.setAvailableCapacityTons(truck.getAvailableCapacityTons().add(weightToFree));
                
                if (truck.getAvailableCapacityTons().compareTo(truck.getCapacityTons()) >= 0) {
                    truck.setAvailableCapacityTons(truck.getCapacityTons());
                    truck.setAvailabilityStatus("AVAILABLE");
                } else {
                    truck.setAvailabilityStatus("PARTIAL_LOAD");
                }
                truckRepository.save(truck);
            }

            // 2. Add Stock to Buyer
            Long buyerId = null;
            String buyerType = null;
            if (order.getRetailer() != null) {
                buyerId = order.getRetailer().getUser().getUserId();
                buyerType = "RETAILER";
            } else if (order.getDistributor() != null) {
                buyerId = order.getDistributor().getUser().getUserId();
                buyerType = "DISTRIBUTOR";
            }

            if (buyerId != null && order.getItems() != null) {
                for (com.chainsight.model.OrderItem item : order.getItems()) {
                    inventoryService.adjustStock(buyerType, buyerId, item.getProduct().getProductId(), item.getQuantity());
                }
            }

            // Log to Blockchain
            blockchainService.logEvent("DELIVERED", buyerType, buyerId, "Order #" + order.getOrderId() + " confirmed as delivered.");
        }

        order.setOrderStatus(cleanStatus);
        if (weight != null) {
            order.setWeightTons(weight);
        }
        return orderRepository.save(order);
    }

    public List<Order> getOpenShipmentRequests(Long transporterUserId) {
        if (transporterUserId != null) {
            // Priority: Orders explicitly assigned to this transporter + General approved orders
            List<Order> targeted = orderRepository.findByTargetTransporterUserUserIdAndAssignedTruckIsNull(transporterUserId);
            List<Order> general = orderRepository.findByOrderStatus("APPROVED");
            // Merge and avoid duplicates
            targeted.addAll(general.stream().filter(o -> o.getTargetTransporter() == null).toList());
            return targeted;
        }
        return orderRepository.findByOrderStatus("APPROVED");
    }

    public Order assignTransporter(Long orderId, Long transporterUserId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        com.chainsight.model.TruckOwner owner = truckOwnerRepository.findByUserUserId(transporterUserId).orElseThrow();
        order.setTargetTransporter(owner);
        return orderRepository.save(order);
    }

    public List<com.chainsight.model.TruckOwner> getAllTransporters() {
        return truckOwnerRepository.findAll();
    }

    public List<Order> getActiveJobs(Long truckOwnerUserId) {
        return orderRepository.findByAssignedTruckOwnerUserUserIdAndOrderStatusIn(truckOwnerUserId, List.of("DISPATCHED", "IN_TRANSIT", "APPROVED", "DELIVERED"));
    }

    public Order assignTruckToOrder(Long orderId, Long truckId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        Truck truck = truckRepository.findById(truckId).orElseThrow(() -> new RuntimeException("Truck not found"));
        
        if (order.getWeightTons() != null && truck.getAvailableCapacityTons() != null) {
            BigDecimal remaining = truck.getAvailableCapacityTons().subtract(order.getWeightTons());
            if (remaining.compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Truck capacity is full. Cannot accept load.");
            }
            truck.setAvailableCapacityTons(remaining);
            if (remaining.compareTo(BigDecimal.ZERO) == 0) {
                truck.setAvailabilityStatus("FULL");
            } else {
                truck.setAvailabilityStatus("PARTIAL_LOAD");
            }
            truckRepository.save(truck);
        }
        
        // --- Deduct Stock from Seller on Dispatch ---
        Long sellerId = null;
        String sellerType = null;
        if (order.getSupplier() != null) {
            sellerId = order.getSupplier().getUser().getUserId();
            sellerType = "SUPPLIER";
        } else if (order.getDistributor() != null && order.getRetailer() != null) {
            // Distributor is selling to Retailer
            sellerId = order.getDistributor().getUser().getUserId();
            sellerType = "DISTRIBUTOR";
        }

        if (sellerId != null && order.getItems() != null) {
            for (com.chainsight.model.OrderItem item : order.getItems()) {
                inventoryService.adjustStock(sellerType, sellerId, item.getProduct().getProductId(), -item.getQuantity());
            }
        }

        // Log to Blockchain
        blockchainService.logEvent("DISPATCHED", sellerType, sellerId, "Order #" + order.getOrderId() + " dispatched via Truck " + truck.getTruckNumber());

        order.setAssignedTruck(truck);
        order.setOrderStatus("DISPATCHED");
        return orderRepository.save(order);
    }
}
