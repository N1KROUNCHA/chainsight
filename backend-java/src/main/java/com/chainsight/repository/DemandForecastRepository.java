package com.chainsight.repository;

import com.chainsight.model.DemandForecast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DemandForecastRepository extends JpaRepository<DemandForecast, String> {
}
