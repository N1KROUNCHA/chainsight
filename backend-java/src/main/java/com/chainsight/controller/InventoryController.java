package com.chainsight.controller;

import com.chainsight.model.Inventory;
import com.chainsight.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/{ownerType}/{ownerId}")
    public ResponseEntity<List<Inventory>> getInventory(@PathVariable String ownerType, @PathVariable Long ownerId) {
        return ResponseEntity.ok(inventoryService.getInventoryByOwner(ownerType, ownerId));
    }

    @PostMapping
    public ResponseEntity<Inventory> addInventory(@RequestBody Inventory inventory) {
        return ResponseEntity.ok(inventoryService.addInventory(inventory));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInventory(@PathVariable Long id) {
        inventoryService.deleteInventory(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Inventory> updateStock(@PathVariable Long id, @RequestBody Integer quantity) {
        return ResponseEntity.ok(inventoryService.updateStock(id, quantity));
    }
}
