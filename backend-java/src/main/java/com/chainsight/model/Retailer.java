package com.chainsight.model;

import jakarta.persistence.*;

@Entity
@Table(name = "retailers")
public class Retailer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "retailer_id")
    private Long retailerId;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private User user;

    @Column(name = "shop_name", nullable = false, length = 120)
    private String shopName;

    @Column(length = 50)
    private String city;

    @Column(length = 50)
    private String state;

    @Column(columnDefinition = "TEXT")
    private String address;

    public Retailer() {}

    public Long getRetailerId() { return retailerId; }
    public void setRetailerId(Long retailerId) { this.retailerId = retailerId; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}
