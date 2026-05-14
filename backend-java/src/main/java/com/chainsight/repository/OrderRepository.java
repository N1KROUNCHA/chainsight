package com.chainsight.repository;

import com.chainsight.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByRetailerUserUserId(Long userId);
    
    // Distributor as Vendor (selling to retailer)
    List<Order> findByDistributorUserUserIdAndRetailerNotNull(Long userId);
    
    // Distributor as Buyer (buying from supplier)
    List<Order> findByDistributorUserUserIdAndSupplierNotNullAndRetailerIsNull(Long userId);
    
    List<Order> findBySupplierUserUserId(Long userId);
    
    List<Order> findByOrderStatus(String orderStatus);
    List<Order> findByTargetTransporterUserUserIdAndAssignedTruckIsNull(Long userId);
    List<Order> findByAssignedTruckOwnerUserUserIdAndOrderStatusIn(Long userId, List<String> statuses);
}
