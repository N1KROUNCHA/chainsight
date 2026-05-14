package com.chainsight.controller;

import com.chainsight.model.Truck;
import com.chainsight.model.TruckOwner;
import com.chainsight.repository.TruckOwnerRepository;
import com.chainsight.repository.TruckRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/trucks")
public class TruckController {

    private final TruckRepository truckRepository;
    private final TruckOwnerRepository truckOwnerRepository;

    public TruckController(TruckRepository truckRepository, TruckOwnerRepository truckOwnerRepository) {
        this.truckRepository = truckRepository;
        this.truckOwnerRepository = truckOwnerRepository;
    }

    @GetMapping("/owner/{userId}")
    public ResponseEntity<List<Truck>> getTrucksByOwnerId(@PathVariable Long userId) {
        return ResponseEntity.ok(truckRepository.findByOwnerUserUserId(userId));
    }

    @PostMapping
    public ResponseEntity<Truck> createTruck(@RequestBody Truck truck) {
        if (truck.getOwner() != null && truck.getOwner().getUser() != null) {
            Long userId = truck.getOwner().getUser().getUserId();
            Optional<TruckOwner> ownerOpt = truckOwnerRepository.findByUserUserId(userId);
            if (ownerOpt.isPresent()) {
                truck.setOwner(ownerOpt.get());
                // Set initial available capacity equal to total capacity
                truck.setAvailableCapacityTons(truck.getCapacityTons());
                return ResponseEntity.ok(truckRepository.save(truck));
            }
        }
        return ResponseEntity.badRequest().build();
    }
}
