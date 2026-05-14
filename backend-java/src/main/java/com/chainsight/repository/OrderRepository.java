package com.chainsight.repository;

import com.chainsight.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByRetailerUserUserId(Long userId);
    List<Order> findByDistributorUserUserId(Long userId);
    List<Order> findBySupplierUserUserId(Long userId);
}
