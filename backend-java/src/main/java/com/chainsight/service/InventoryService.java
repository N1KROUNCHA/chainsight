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
}
