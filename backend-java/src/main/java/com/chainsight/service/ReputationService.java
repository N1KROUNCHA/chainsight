package com.chainsight.service;

import com.chainsight.model.Order;
import com.chainsight.model.User;
import com.chainsight.model.UserReputation;
import com.chainsight.repository.UserReputationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.MathContext;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
@Transactional
public class ReputationService {

    private final UserReputationRepository reputationRepository;
    private static final BigDecimal K_FACTOR = new BigDecimal("0.5");
    private static final BigDecimal PENALTY_RATE = new BigDecimal("0.9");

    public ReputationService(UserReputationRepository reputationRepository) {
        this.reputationRepository = reputationRepository;
    }

    private UserReputation getOrCreateReputation(User user) {
        return reputationRepository.findByUserUserId(user.getUserId())
                .orElseGet(() -> {
                    UserReputation rep = new UserReputation(user);
                    return reputationRepository.save(rep);
                });
    }

    public void processSuccessfulDelivery(User user, User partner, Order order) {
        if (user == null) return;
        UserReputation rep = getOrCreateReputation(user);

        rep.setTotalDeliveries(rep.getTotalDeliveries() + 1);

        double totalSuccess = rep.getTotalDeliveries();
        double growth = K_FACTOR.doubleValue() * Math.log10(1 + totalSuccess);
        
        // 1. Efficiency Bonus (Speed)
        if (order.getCreatedAt() != null && order.getDeliveredAt() != null) {
            long hours = Duration.between(order.getCreatedAt(), order.getDeliveredAt()).toHours();
            if (hours < 24) {
                growth *= 1.2;
            }
        }

        // 2. Graph-Based Weighted Trust (PageRank Style)
        if (partner != null) {
            UserReputation partnerRep = getOrCreateReputation(partner);
            double partnerScore = partnerRep.getScore().doubleValue();
            // Normalized weight around base score of 10.0
            double trustWeight = partnerScore / 10.0;
            growth *= trustWeight;
        }

        BigDecimal currentScore = rep.getScore();
        if (currentScore == null) currentScore = new BigDecimal("10.0");
        
        rep.setScore(currentScore.add(BigDecimal.valueOf(growth), MathContext.DECIMAL32));
        rep.setLastUpdated(LocalDateTime.now());

        reputationRepository.save(rep);
    }

    public void slashReputation(User user, Order order) {
        if (user == null) return;
        UserReputation rep = getOrCreateReputation(user);

        BigDecimal currentScore = rep.getScore();
        if (currentScore == null) currentScore = new BigDecimal("10.0");
        rep.setScore(currentScore.multiply(PENALTY_RATE, MathContext.DECIMAL32));

        BigDecimal currentStake = rep.getStakeBalance();
        if (currentStake == null) currentStake = BigDecimal.ZERO;

        if (currentStake.compareTo(BigDecimal.ZERO) > 0) {
            rep.setStakeBalance(currentStake.multiply(PENALTY_RATE, MathContext.DECIMAL32));
        }

        rep.setLastUpdated(LocalDateTime.now());
        reputationRepository.save(rep);
    }

    public void addStake(User user, BigDecimal amount) {
        UserReputation rep = getOrCreateReputation(user);
        BigDecimal current = rep.getStakeBalance();
        if (current == null) current = BigDecimal.ZERO;
        rep.setStakeBalance(current.add(amount));
        rep.setLastUpdated(LocalDateTime.now());
        reputationRepository.save(rep);
    }
}
