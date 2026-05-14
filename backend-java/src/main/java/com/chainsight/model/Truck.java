package com.chainsight.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "trucks")
public class Truck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "truck_id")
    private Long truckId;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private TruckOwner owner;

    @Column(name = "truck_number", unique = true, nullable = false, length = 30)
    private String truckNumber;

    @Column(name = "capacity_tons", precision = 10, scale = 2)
    private BigDecimal capacityTons;

    @Column(name = "available_capacity_tons", precision = 10, scale = 2)
    private BigDecimal availableCapacityTons;

    @Column(name = "availability_status", length = 30)
    private String availabilityStatus; // AVAILABLE, BUSY, MAINTENANCE

    @Column(name = "current_city", length = 50)
    private String currentCity;

    @Column(name = "route", length = 200)
    private String route; // e.g. "Mumbai → Delhi → Jaipur"

    public Truck() {}

    public Long getTruckId() { return truckId; }
    public void setTruckId(Long truckId) { this.truckId = truckId; }
    public TruckOwner getOwner() { return owner; }
    public void setOwner(TruckOwner owner) { this.owner = owner; }
    public String getTruckNumber() { return truckNumber; }
    public void setTruckNumber(String truckNumber) { this.truckNumber = truckNumber; }
    public BigDecimal getCapacityTons() { return capacityTons; }
    public void setCapacityTons(BigDecimal capacityTons) { this.capacityTons = capacityTons; }
    public BigDecimal getAvailableCapacityTons() { return availableCapacityTons; }
    public void setAvailableCapacityTons(BigDecimal availableCapacityTons) { this.availableCapacityTons = availableCapacityTons; }
    public String getAvailabilityStatus() { return availabilityStatus; }
    public void setAvailabilityStatus(String availabilityStatus) { this.availabilityStatus = availabilityStatus; }
    public String getCurrentCity() { return currentCity; }
    public void setCurrentCity(String currentCity) { this.currentCity = currentCity; }
    public String getRoute() { return route; }
    public void setRoute(String route) { this.route = route; }
}
