package com.chainsight.service;

import com.chainsight.model.Inventory;
import com.chainsight.repository.InventoryRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public List<Inventory> getInventoryByOwner(String ownerType, Long ownerId) {
        return inventoryRepository.findByOwnerTypeAndOwnerId(ownerType, ownerId);
    }

    public Inventory addInventory(Inventory inventory) {
        // Check if item already exists for this owner and product
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
            // If delta is positive and inventory doesn't exist, we might want to create it
            // but usually for a receiver, we'd need to know more info. 
            // For now, let's just log or ignore.
            System.out.println("Inventory record not found for product " + productId + " to add stock.");
        }
    }
}
