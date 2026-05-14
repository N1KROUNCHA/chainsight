package com.chainsight.model;

import jakarta.persistence.*;

@Entity
@Table(name = "distributors")
public class Distributor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "distributor_id")
    private Long distributorId;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private User user;

    @Column(name = "company_name", nullable = false, length = 120)
    private String companyName;

    @Column(name = "warehouse_capacity")
    private Integer warehouseCapacity;

    @Column(length = 50)
    private String city;

    @Column(length = 50)
    private String state;

    @Column(columnDefinition = "TEXT")
    private String address;

    public Distributor() {}

    public Long getDistributorId() { return distributorId; }
    public void setDistributorId(Long distributorId) { this.distributorId = distributorId; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public Integer getWarehouseCapacity() { return warehouseCapacity; }
    public void setWarehouseCapacity(Integer warehouseCapacity) { this.warehouseCapacity = warehouseCapacity; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}
