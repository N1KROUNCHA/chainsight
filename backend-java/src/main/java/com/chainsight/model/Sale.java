package com.chainsight.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "sales_dataset")
public class Sale {

    @Id
    @Column(name = "sale_id", length = 20)
    private String saleId;

    @Column(name = "retailer_id", length = 20)
    private String retailerId;

    @Column(length = 50)
    private String city;

    @Column(length = 50)
    private String state;

    @Column(name = "product_id", length = 20)
    private String productId;

    @Column(name = "product_name", length = 100)
    private String productName;

    @Column(name = "units_sold")
    private Integer unitsSold;

    @Column(name = "unit_price", precision = 19, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "sales_amount", precision = 19, scale = 2)
    private BigDecimal salesAmount;

    @Column(name = "sale_date")
    private LocalDate saleDate;

    public Sale() {}

    public Sale(String saleId, String retailerId, String city, String state, String productId, String productName, Integer unitsSold, BigDecimal unitPrice, BigDecimal salesAmount, LocalDate saleDate) {
        this.saleId = saleId;
        this.retailerId = retailerId;
        this.city = city;
        this.state = state;
        this.productId = productId;
        this.productName = productName;
        this.unitsSold = unitsSold;
        this.unitPrice = unitPrice;
        this.salesAmount = salesAmount;
        this.saleDate = saleDate;
    }

    public String getSaleId() { return saleId; }
    public void setSaleId(String saleId) { this.saleId = saleId; }
    public String getRetailerId() { return retailerId; }
    public void setRetailerId(String retailerId) { this.retailerId = retailerId; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public Integer getUnitsSold() { return unitsSold; }
    public void setUnitsSold(Integer unitsSold) { this.unitsSold = unitsSold; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getSalesAmount() { return salesAmount; }
    public void setSalesAmount(BigDecimal salesAmount) { this.salesAmount = salesAmount; }
    public LocalDate getSaleDate() { return saleDate; }
    public void setSaleDate(LocalDate saleDate) { this.saleDate = saleDate; }
}
