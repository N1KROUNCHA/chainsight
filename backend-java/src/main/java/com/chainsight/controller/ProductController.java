package com.chainsight.controller;

import com.chainsight.model.Product;
import com.chainsight.model.Supplier;
import com.chainsight.repository.ProductRepository;
import com.chainsight.repository.SupplierRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;

    public ProductController(ProductRepository productRepository, SupplierRepository supplierRepository) {
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        if (product.getSupplier() != null && product.getSupplier().getUser() != null) {
            Long userId = product.getSupplier().getUser().getUserId();
            Optional<Supplier> supplierOpt = supplierRepository.findByUserUserId(userId);
            if (supplierOpt.isPresent()) {
                product.setSupplier(supplierOpt.get());
            } else {
                return ResponseEntity.badRequest().build();
            }
        } else {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(productRepository.save(product));
    }
}
