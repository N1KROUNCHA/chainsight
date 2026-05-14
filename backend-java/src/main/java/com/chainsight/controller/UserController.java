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

    public UserController(SupplierRepository supplierRepository, DistributorRepository distributorRepository) {
        this.supplierRepository = supplierRepository;
        this.distributorRepository = distributorRepository;
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
