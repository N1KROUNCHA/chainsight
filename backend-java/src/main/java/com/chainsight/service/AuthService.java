package com.chainsight.service;

import com.chainsight.model.User;
import com.chainsight.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {

    private final com.chainsight.repository.UserRepository userRepository;
    private final com.chainsight.repository.SupplierRepository supplierRepository;
    private final com.chainsight.repository.DistributorRepository distributorRepository;
    private final com.chainsight.repository.RetailerRepository retailerRepository;
    private final com.chainsight.repository.TruckOwnerRepository truckOwnerRepository;

    public AuthService(com.chainsight.repository.UserRepository userRepository,
                       com.chainsight.repository.SupplierRepository supplierRepository,
                       com.chainsight.repository.DistributorRepository distributorRepository,
                       com.chainsight.repository.RetailerRepository retailerRepository,
                       com.chainsight.repository.TruckOwnerRepository truckOwnerRepository) {
        this.userRepository = userRepository;
        this.supplierRepository = supplierRepository;
        this.distributorRepository = distributorRepository;
        this.retailerRepository = retailerRepository;
        this.truckOwnerRepository = truckOwnerRepository;
    }

    public User register(User user) {
        // 1. Save Base User
        User savedUser = userRepository.save(user);
        
        // 2. Create Role-Specific Profile
        String role = user.getRole();
        if ("SUPPLIER".equals(role)) {
            com.chainsight.model.Supplier s = new com.chainsight.model.Supplier();
            s.setUser(savedUser);
            s.setCompanyName(user.getFullName() + " Enterprises");
            s.setCity("Unassigned");
            supplierRepository.save(s);
        } else if ("DISTRIBUTOR".equals(role)) {
            com.chainsight.model.Distributor d = new com.chainsight.model.Distributor();
            d.setUser(savedUser);
            d.setCompanyName(user.getFullName() + " Logistics Hub");
            d.setCity("Unassigned");
            distributorRepository.save(d);
        } else if ("RETAILER".equals(role)) {
            com.chainsight.model.Retailer r = new com.chainsight.model.Retailer();
            r.setUser(savedUser);
            r.setShopName(user.getFullName() + " Retail");
            r.setCity("Unassigned");
            retailerRepository.save(r);
        } else if ("TRUCK_OWNER".equals(role)) {
            com.chainsight.model.TruckOwner t = new com.chainsight.model.TruckOwner();
            t.setUser(savedUser);
            t.setCompanyName(user.getFullName() + " Fleet Management");
            truckOwnerRepository.save(t);
        }
        
        return savedUser;
    }

    public Optional<User> login(String email, String password) {
        return userRepository.findByEmail(email)
                .filter(u -> u.getPassword().equals(password));
    }
}
