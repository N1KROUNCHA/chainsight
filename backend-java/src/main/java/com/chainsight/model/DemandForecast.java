package com.chainsight.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "demand_forecasting_dataset")
public class DemandForecast {

    @Id
    @Column(name = "forecast_id", length = 20)
    private String forecastId;

    @Column(name = "product_id", length = 20)
    private String productId;

    @Column(name = "retailer_id", length = 20)
    private String retailerId;

    @Column(name = "historical_sales")
    private Integer historicalSales;

    @Column(name = "predicted_demand")
    private Integer predictedDemand;

    @Column(name = "forecast_confidence", precision = 5, scale = 2)
    private BigDecimal forecastConfidence;

    @Column(name = "forecast_date")
    private LocalDate forecastDate;

    public DemandForecast() {}

    public DemandForecast(String forecastId, String productId, String retailerId, Integer historicalSales, Integer predictedDemand, BigDecimal forecastConfidence, LocalDate forecastDate) {
        this.forecastId = forecastId;
        this.productId = productId;
        this.retailerId = retailerId;
        this.historicalSales = historicalSales;
        this.predictedDemand = predictedDemand;
        this.forecastConfidence = forecastConfidence;
        this.forecastDate = forecastDate;
    }

    public String getForecastId() { return forecastId; }
    public void setForecastId(String forecastId) { this.forecastId = forecastId; }
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public String getRetailerId() { return retailerId; }
    public void setRetailerId(String retailerId) { this.retailerId = retailerId; }
    public Integer getHistoricalSales() { return historicalSales; }
    public void setHistoricalSales(Integer historicalSales) { this.historicalSales = historicalSales; }
    public Integer getPredictedDemand() { return predictedDemand; }
    public void setPredictedDemand(Integer predictedDemand) { this.predictedDemand = predictedDemand; }
    public BigDecimal getForecastConfidence() { return forecastConfidence; }
    public void setForecastConfidence(BigDecimal forecastConfidence) { this.forecastConfidence = forecastConfidence; }
    public LocalDate getForecastDate() { return forecastDate; }
    public void setForecastDate(LocalDate forecastDate) { this.forecastDate = forecastDate; }
}
