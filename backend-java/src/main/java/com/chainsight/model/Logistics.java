package com.chainsight.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "logistics_dataset")
public class Logistics {

    @Id
    @Column(name = "shipment_id", length = 20)
    private String shipmentId;

    @Column(name = "truck_id", length = 20)
    private String truckId;

    @Column(name = "supplier_id", length = 20)
    private String supplierId;

    @Column(name = "warehouse_id", length = 20)
    private String warehouseId;

    @Column(name = "retailer_id", length = 20)
    private String retailerId;

    @Column(name = "source_city", length = 50)
    private String sourceCity;

    @Column(name = "destination_city", length = 50)
    private String destinationCity;

    @Column(name = "dispatch_date")
    private LocalDate dispatchDate;

    @Column(name = "expected_delivery_days")
    private Integer expectedDeliveryDays;

    @Column(name = "actual_delivery_days")
    private Integer actualDeliveryDays;

    @Column(name = "delay_days")
    private Integer delayDays;

    @Column(name = "bottleneck_stage", length = 100)
    private String bottleneckStage;

    @Column(name = "shipment_status", length = 20)
    private String shipmentStatus;

    public Logistics() {}

    public Logistics(String shipmentId, String truckId, String supplierId, String warehouseId, String retailerId, String sourceCity, String destinationCity, LocalDate dispatchDate, Integer expectedDeliveryDays, Integer actualDeliveryDays, Integer delayDays, String bottleneckStage, String shipmentStatus) {
        this.shipmentId = shipmentId;
        this.truckId = truckId;
        this.supplierId = supplierId;
        this.warehouseId = warehouseId;
        this.retailerId = retailerId;
        this.sourceCity = sourceCity;
        this.destinationCity = destinationCity;
        this.dispatchDate = dispatchDate;
        this.expectedDeliveryDays = expectedDeliveryDays;
        this.actualDeliveryDays = actualDeliveryDays;
        this.delayDays = delayDays;
        this.bottleneckStage = bottleneckStage;
        this.shipmentStatus = shipmentStatus;
    }

    public String getShipmentId() { return shipmentId; }
    public void setShipmentId(String shipmentId) { this.shipmentId = shipmentId; }
    public String getTruckId() { return truckId; }
    public void setTruckId(String truckId) { this.truckId = truckId; }
    public String getSupplierId() { return supplierId; }
    public void setSupplierId(String supplierId) { this.supplierId = supplierId; }
    public String getWarehouseId() { return warehouseId; }
    public void setWarehouseId(String warehouseId) { this.warehouseId = warehouseId; }
    public String getRetailerId() { return retailerId; }
    public void setRetailerId(String retailerId) { this.retailerId = retailerId; }
    public String getSourceCity() { return sourceCity; }
    public void setSourceCity(String sourceCity) { this.sourceCity = sourceCity; }
    public String getDestinationCity() { return destinationCity; }
    public void setDestinationCity(String destinationCity) { this.destinationCity = destinationCity; }
    public LocalDate getDispatchDate() { return dispatchDate; }
    public void setDispatchDate(LocalDate dispatchDate) { this.dispatchDate = dispatchDate; }
    public Integer getExpectedDeliveryDays() { return expectedDeliveryDays; }
    public void setExpectedDeliveryDays(Integer expectedDeliveryDays) { this.expectedDeliveryDays = expectedDeliveryDays; }
    public Integer getActualDeliveryDays() { return actualDeliveryDays; }
    public void setActualDeliveryDays(Integer actualDeliveryDays) { this.actualDeliveryDays = actualDeliveryDays; }
    public Integer getDelayDays() { return delayDays; }
    public void setDelayDays(Integer delayDays) { this.delayDays = delayDays; }
    public String getBottleneckStage() { return bottleneckStage; }
    public void setBottleneckStage(String bottleneckStage) { this.bottleneckStage = bottleneckStage; }
    public String getShipmentStatus() { return shipmentStatus; }
    public void setShipmentStatus(String shipmentStatus) { this.shipmentStatus = shipmentStatus; }
}
