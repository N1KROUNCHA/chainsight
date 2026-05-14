package com.chainsight.config;

import com.chainsight.model.*;
import com.chainsight.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final DistributorRepository distributorRepository;
    private final RetailerRepository retailerRepository;
    private final TruckOwnerRepository truckOwnerRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    public DataSeeder(UserRepository userRepository, 
                      SupplierRepository supplierRepository,
                      DistributorRepository distributorRepository,
                      RetailerRepository retailerRepository,
                      TruckOwnerRepository truckOwnerRepository,
                      ProductRepository productRepository,
                      InventoryRepository inventoryRepository) {
        this.userRepository = userRepository;
        this.supplierRepository = supplierRepository;
        this.distributorRepository = distributorRepository;
        this.retailerRepository = retailerRepository;
        this.truckOwnerRepository = truckOwnerRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) return;

        // 1. Create Supplier
        User sUser = new User();
        sUser.setFullName("Global Fabrics Supplier");
        sUser.setEmail("supplier@msme.com");
        sUser.setPassword("password123");
        sUser.setRole("SUPPLIER");
        userRepository.save(sUser);
        
        Supplier supplier = new Supplier();
        supplier.setUser(sUser);
        supplier.setCompanyName("Global Fabrics Ltd");
        supplier.setCity("Surat");
        supplierRepository.save(supplier);

        // 2. Create Distributor
        User dUser = new User();
        dUser.setFullName("North India Logistics");
        dUser.setEmail("middleman@msme.com");
        dUser.setPassword("password123");
        dUser.setRole("DISTRIBUTOR");
        userRepository.save(dUser);
        
        Distributor distributor = new Distributor();
        distributor.setUser(dUser);
        distributor.setCompanyName("North India Logistics Hub");
        distributor.setWarehouseCapacity(5000);
        distributor.setCity("Delhi");
        distributorRepository.save(distributor);

        // 3. Create Retailer
        User rUser = new User();
        rUser.setFullName("City Supermarket");
        rUser.setEmail("supermarket_demo@msme.com");
        rUser.setPassword("password123");
        rUser.setRole("RETAILER");
        userRepository.save(rUser);
        
        Retailer retailer = new Retailer();
        retailer.setUser(rUser);
        retailer.setShopName("City Supermarket #1");
        retailer.setCity("Mumbai");
        retailerRepository.save(retailer);

        // 4. Create Truck Owner
        User tUser = new User();
        tUser.setFullName("Swift Transporters");
        tUser.setEmail("transporter@msme.com");
        tUser.setPassword("password123");
        tUser.setRole("TRUCK_OWNER");
        userRepository.save(tUser);
        
        TruckOwner owner = new TruckOwner();
        owner.setUser(tUser);
        owner.setCompanyName("Swift Transporters Co.");
        truckOwnerRepository.save(owner);

        // 5. Create Sample Products
        Product p1 = new Product();
        p1.setProductName("Premium Cotton Fabric");
        p1.setCategory("RAW_MATERIAL");
        p1.setUnit("METERS");
        p1.setSupplier(supplier);
        productRepository.save(p1);

        Product p2 = new Product();
        p2.setProductName("Industrial Silk Thread");
        p2.setCategory("RAW_MATERIAL");
        p2.setUnit("ROLLS");
        p2.setSupplier(supplier);
        productRepository.save(p2);

        Product p3 = new Product();
        p3.setProductName("Cotton T-Shirt (Bulk)");
        p3.setCategory("FINISHED_GOOD");
        p3.setUnit("PIECES");
        p3.setSupplier(supplier);
        productRepository.save(p3);

        // 6. Create Distributor Inventory
        Inventory di1 = new Inventory();
        di1.setOwnerType("DISTRIBUTOR");
        di1.setOwnerId(dUser.getUserId());
        di1.setProduct(p1);
        di1.setQuantity(500);
        di1.setReorderPoint(100);
        di1.setSafetyStock(50);
        inventoryRepository.save(di1);

        Inventory di2 = new Inventory();
        di2.setOwnerType("DISTRIBUTOR");
        di2.setOwnerId(dUser.getUserId());
        di2.setProduct(p2);
        di2.setQuantity(1200);
        di2.setReorderPoint(200);
        di2.setSafetyStock(100);
        inventoryRepository.save(di2);

        System.out.println("✅ Database Seeded with Multi-Role Test Users, Products, and Distributor Inventory");
    }
}
