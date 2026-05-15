package com.chainsight.service;

import com.chainsight.model.Inventory;
import com.chainsight.repository.InventoryRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final com.chainsight.repository.ProductRepository productRepository;

    public InventoryService(InventoryRepository inventoryRepository, com.chainsight.repository.ProductRepository productRepository) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
    }

    public List<Inventory> getInventoryByOwner(String ownerType, Long ownerId) {
        return inventoryRepository.findByOwnerTypeAndOwnerId(ownerType, ownerId);
    }

    public Inventory addInventory(Inventory inventory) {
        return inventoryRepository.save(inventory);
    }

    public void deleteInventory(Long id) {
        inventoryRepository.deleteById(id);
    }

    public Inventory updateStock(Long inventoryId, Integer quantity) {
        Inventory inventory = inventoryRepository.findById(inventoryId).orElseThrow();
        inventory.setQuantity(quantity);
        return inventoryRepository.save(inventory);
    }

    public void adjustStock(String ownerType, Long ownerUserId, Long productId, int delta) {
        Inventory inv = inventoryRepository.findByOwnerTypeAndOwnerId(ownerType, ownerUserId)
                .stream()
                .filter(i -> i.getProduct().getProductId().equals(productId))
                .findFirst()
                .orElse(null);

        if (inv != null) {
            inv.setQuantity(inv.getQuantity() + delta);
            if (inv.getQuantity() < 0) inv.setQuantity(0);
            inventoryRepository.save(inv);
        } else if (delta > 0) {
            // Auto-create inventory for the buyer/distributor
            com.chainsight.model.Product product = productRepository.findById(productId).orElse(null);
            if (product != null) {
                Inventory newInv = new Inventory();
                newInv.setOwnerType(ownerType);
                newInv.setOwnerId(ownerUserId);
                newInv.setProduct(product);
                newInv.setQuantity(delta);
                newInv.setReorderPoint(10); // Default for now
                newInv.setSafetyStock(5);   // Default for now
                inventoryRepository.save(newInv);
                System.out.println("✅ Created new inventory record for product " + productId + " for " + ownerType);
            }
        }
    }
}
