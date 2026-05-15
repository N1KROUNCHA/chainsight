package com.chainsight.controller;

import com.chainsight.model.*;
import com.chainsight.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/users")
public class UserController {

    private final SupplierRepository supplierRepository;
    private final DistributorRepository distributorRepository;
    private final UserRepository userRepository;
    private final com.chainsight.service.ReputationService reputationService;

    public UserController(SupplierRepository supplierRepository, 
                          DistributorRepository distributorRepository,
                          UserRepository userRepository,
                          com.chainsight.service.ReputationService reputationService) {
        this.supplierRepository = supplierRepository;
        this.distributorRepository = distributorRepository;
        this.userRepository = userRepository;
        this.reputationService = reputationService;
    }

    @PostMapping("/{userId}/stake")
    public ResponseEntity<User> stake(@PathVariable long userId, @RequestBody java.util.Map<String, Object> body) {
        User user = userRepository.findById(userId).orElseThrow();
        
        Object amountObj = body.get("amount");
        if (amountObj == null) {
            return ResponseEntity.badRequest().build();
        }
        
        java.math.BigDecimal amount;
        if (amountObj instanceof Number) {
            amount = new java.math.BigDecimal(amountObj.toString());
        } else {
            amount = new java.math.BigDecimal(amountObj.toString());
        }

        reputationService.addStake(user, amount);
        User saved = userRepository.findById(userId).orElseThrow();
        System.out.println("💰 STAKE UPDATE: User " + userId + " | Added: " + amount);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUser(@PathVariable long userId) {
        return ResponseEntity.ok(userRepository.findById(userId).orElseThrow());
    }

    @GetMapping("/suppliers")
    public ResponseEntity<List<Supplier>> getSuppliers() {
        return ResponseEntity.ok(supplierRepository.findAll());
    }

    @GetMapping("/distributors")
    public ResponseEntity<List<Distributor>> getDistributors() {
        return ResponseEntity.ok(distributorRepository.findAll());
    }
}
