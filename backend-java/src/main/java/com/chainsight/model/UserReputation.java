package com.chainsight.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "user_reputations")
public class UserReputation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    @JsonIgnore
    private User user;

    @Column(name = "score", precision = 10, scale = 2)
    private BigDecimal score = new BigDecimal("10.0");

    @Column(name = "stake_balance", precision = 10, scale = 2)
    private BigDecimal stakeBalance = BigDecimal.ZERO;

    @Column(name = "total_deliveries")
    private Integer totalDeliveries = 0;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated = LocalDateTime.now();

    public UserReputation() {}

    public UserReputation(User user) {
        this.user = user;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public BigDecimal getScore() { return score; }
    public void setScore(BigDecimal score) { this.score = score; }

    public BigDecimal getStakeBalance() { return stakeBalance; }
    public void setStakeBalance(BigDecimal stakeBalance) { this.stakeBalance = stakeBalance; }

    public Integer getTotalDeliveries() { return totalDeliveries; }
    public void setTotalDeliveries(Integer totalDeliveries) { this.totalDeliveries = totalDeliveries; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
