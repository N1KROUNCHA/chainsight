package com.chainsight.config;

import com.chainsight.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    public DataSeeder(UserRepository userRepository,
                      SupplierRepository supplierRepository,
                      DistributorRepository distributorRepository,
                      RetailerRepository retailerRepository,
                      TruckOwnerRepository truckOwnerRepository,
                      ProductRepository productRepository,
                      InventoryRepository inventoryRepository,
                      OrderRepository orderRepository,
                      BlockchainEventRepository blockchainEventRepository,
                      DemandForecastRepository demandForecastRepository) {
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🌱 System ready. No seed data applied as per user request. Use 'Register' to create new users.");
    }
}
