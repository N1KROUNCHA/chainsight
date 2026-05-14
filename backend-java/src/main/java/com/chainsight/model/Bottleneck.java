package com.chainsight.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "bottleneck_dataset")
public class Bottleneck {

    @Id
    @Column(name = "analysis_id", length = 20)
    private String analysisId;

    @Column(name = "stage_name", length = 100)
    private String stageName;

    @Column(name = "average_delay_hours", precision = 10, scale = 2)
    private BigDecimal averageDelayHours;

    @Column(name = "queue_size")
    private Integer queueSize;

    @Column(name = "throughput_units")
    private Integer throughputUnits;

    @Column(name = "bottleneck_score", precision = 5, scale = 2)
    private BigDecimal bottleneckScore;

    @Column(name = "is_bottleneck", length = 10)
    private String isBottleneck;

    public Bottleneck() {}

    public Bottleneck(String analysisId, String stageName, BigDecimal averageDelayHours, Integer queueSize, Integer throughputUnits, BigDecimal bottleneckScore, String isBottleneck) {
        this.analysisId = analysisId;
        this.stageName = stageName;
        this.averageDelayHours = averageDelayHours;
        this.queueSize = queueSize;
        this.throughputUnits = throughputUnits;
        this.bottleneckScore = bottleneckScore;
        this.isBottleneck = isBottleneck;
    }

    public String getAnalysisId() { return analysisId; }
    public void setAnalysisId(String analysisId) { this.analysisId = analysisId; }
    public String getStageName() { return stageName; }
    public void setStageName(String stageName) { this.stageName = stageName; }
    public BigDecimal getAverageDelayHours() { return averageDelayHours; }
    public void setAverageDelayHours(BigDecimal averageDelayHours) { this.averageDelayHours = averageDelayHours; }
    public Integer getQueueSize() { return queueSize; }
    public void setQueueSize(Integer queueSize) { this.queueSize = queueSize; }
    public Integer getThroughputUnits() { return throughputUnits; }
    public void setThroughputUnits(Integer throughputUnits) { this.throughputUnits = throughputUnits; }
    public BigDecimal getBottleneckScore() { return bottleneckScore; }
    public void setBottleneckScore(BigDecimal bottleneckScore) { this.bottleneckScore = bottleneckScore; }
    public String getIsBottleneck() { return isBottleneck; }
    public void setIsBottleneck(String isBottleneck) { this.isBottleneck = isBottleneck; }
}
