package com.chainsight.config;

import com.chainsight.model.*;
import com.chainsight.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final DistributorRepository distributorRepository;
    private final RetailerRepository retailerRepository;
    private final TruckOwnerRepository truckOwnerRepository;
    private final TruckRepository truckRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    public DataSeeder(UserRepository userRepository,
                      SupplierRepository supplierRepository,
                      DistributorRepository distributorRepository,
                      RetailerRepository retailerRepository,
                      TruckOwnerRepository truckOwnerRepository,
                      TruckRepository truckRepository,
                      ProductRepository productRepository,
                      InventoryRepository inventoryRepository) {
        this.userRepository = userRepository;
        this.supplierRepository = supplierRepository;
        this.distributorRepository = distributorRepository;
        this.retailerRepository = retailerRepository;
        this.truckOwnerRepository = truckOwnerRepository;
        this.truckRepository = truckRepository;
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

        // 4a. Seed Trucks for this owner (3 sizes: Small=5T, Medium=15T, Large=25T)
        Truck truck1 = new Truck();
        truck1.setOwner(owner);
        truck1.setTruckNumber("MH-04-AB-1234");
        truck1.setCapacityTons(new BigDecimal("5.00"));
        truck1.setAvailableCapacityTons(new BigDecimal("5.00"));
        truck1.setAvailabilityStatus("AVAILABLE");
        truck1.setCurrentCity("Mumbai");
        truck1.setRoute("Mumbai → Pune → Hyderabad");
        truckRepository.save(truck1);

        Truck truck2 = new Truck();
        truck2.setOwner(owner);
        truck2.setTruckNumber("GJ-01-CD-5678");
        truck2.setCapacityTons(new BigDecimal("15.00"));
        truck2.setAvailableCapacityTons(new BigDecimal("15.00"));
        truck2.setAvailabilityStatus("AVAILABLE");
        truck2.setCurrentCity("Surat");
        truck2.setRoute("Surat → Indore → Bhopal");
        truckRepository.save(truck2);

        Truck truck3 = new Truck();
        truck3.setOwner(owner);
        truck3.setTruckNumber("DL-03-EF-9012");
        truck3.setCapacityTons(new BigDecimal("25.00"));
        truck3.setAvailableCapacityTons(new BigDecimal("25.00"));
        truck3.setAvailabilityStatus("AVAILABLE");
        truck3.setCurrentCity("Delhi");
        truck3.setRoute("Delhi → Jaipur → Ahmedabad");
        truckRepository.save(truck3);

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

        // --- Additional Suppliers ---
        createSupplier("Agro-Pure Industries", "agro_supplier@msme.com", "Indore", "RAW_MATERIAL", "Organic Wheat Bulk", "KG");
        createSupplier("Steel Craft Corp", "steel_supplier@msme.com", "Jamshedpur", "RAW_MATERIAL", "Industrial Steel Rods", "TONS");
        createSupplier("Bio-Tech Pharma", "pharma_supplier@msme.com", "Hyderabad", "MEDICAL", "Standard Sanitizer (Bulk)", "LITERS");

        // --- Additional Distributors ---
        createDistributor("Central India Logistics", "central_dist@msme.com", "Nagpur", 8000);
        createDistributor("South Connect Supply", "south_dist@msme.com", "Chennai", 6500);
        createDistributor("East Gate Warehousing", "east_dist@msme.com", "Kolkata", 4500);

        // --- Additional Retailers ---
        createRetailer("Green Groceries", "green_retailer@msme.com", "Bangalore");
        createRetailer("Modern Electronics", "modern_retailer@msme.com", "Pune");
        createRetailer("Health First Pharmacy", "health_retailer@msme.com", "Chandigarh");

        // --- Additional Transporters ---
        createTransporter("Viking Haulage", "viking_trucks@msme.com", "Ahmedabad", "GJ-02-VH-8888", "18.00");
        createTransporter("Oceanic Freight", "oceanic_trucks@msme.com", "Kochi", "KL-07-OF-9999", "22.00");
        createTransporter("Mountain Express", "mountain_trucks@msme.com", "Srinagar", "JK-01-ME-1111", "12.00");

        System.out.println("✅ Database Seeded with Extended Multi-Role Test Users, Products, Trucks, and Inventory");
    }

    private void createSupplier(String company, String email, String city, String cat, String pName, String unit) {
        User u = new User();
        u.setFullName(company + " Manager");
        u.setEmail(email);
        u.setPassword("password123");
        u.setRole("SUPPLIER");
        userRepository.save(u);

        Supplier s = new Supplier();
        s.setUser(u);
        s.setCompanyName(company);
        s.setCity(city);
        supplierRepository.save(s);

        Product p = new Product();
        p.setProductName(pName);
        p.setCategory(cat);
        p.setUnit(unit);
        p.setSupplier(s);
        productRepository.save(p);

        Inventory inv = new Inventory();
        inv.setOwnerType("SUPPLIER");
        inv.setOwnerId(u.getUserId());
        inv.setProduct(p);
        inv.setQuantity(2000);
        inv.setReorderPoint(500);
        inv.setSafetyStock(100);
        inventoryRepository.save(inv);
    }

    private void createDistributor(String company, String email, String city, int cap) {
        User u = new User();
        u.setFullName(company + " Hub");
        u.setEmail(email);
        u.setPassword("password123");
        u.setRole("DISTRIBUTOR");
        userRepository.save(u);

        Distributor d = new Distributor();
        d.setUser(u);
        d.setCompanyName(company);
        d.setCity(city);
        d.setWarehouseCapacity(cap);
        distributorRepository.save(d);
    }

    private void createRetailer(String shop, String email, String city) {
        User u = new User();
        u.setFullName(shop + " Owner");
        u.setEmail(email);
        u.setPassword("password123");
        u.setRole("RETAILER");
        userRepository.save(u);

        Retailer r = new Retailer();
        r.setUser(u);
        r.setShopName(shop);
        r.setCity(city);
        retailerRepository.save(r);
    }

    private void createTransporter(String company, String email, String city, String truckNum, String cap) {
        User u = new User();
        u.setFullName(company + " Fleet");
        u.setEmail(email);
        u.setPassword("password123");
        u.setRole("TRUCK_OWNER");
        userRepository.save(u);

        TruckOwner o = new TruckOwner();
        o.setUser(u);
        o.setCompanyName(company);
        truckOwnerRepository.save(o);

        Truck t = new Truck();
        t.setOwner(o);
        t.setTruckNumber(truckNum);
        t.setCapacityTons(new BigDecimal(cap));
        t.setAvailableCapacityTons(new BigDecimal(cap));
        t.setAvailabilityStatus("AVAILABLE");
        t.setCurrentCity(city);
        t.setRoute(city + " → Regional Hubs");
        truckRepository.save(t);
    }
}
