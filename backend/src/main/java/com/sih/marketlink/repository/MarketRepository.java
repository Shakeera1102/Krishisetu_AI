package com.sih.marketlink.repository;

import com.sih.marketlink.entity.Market;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarketRepository extends JpaRepository<Market, Long> {
    Optional<Market> findByNameIgnoreCase(String name);
    List<Market> findByStateIgnoreCase(String state);
    List<Market> findByDistrictIgnoreCase(String district);
    List<Market> findByActiveTrue();

    @Query("SELECT m FROM Market m WHERE m.active = true")
    List<Market> findAllActiveMarkets();
}
