package com.sih.marketlink.repository;

import com.sih.marketlink.entity.MarketPrice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MarketPriceRepository extends JpaRepository<MarketPrice, Long>, JpaSpecificationExecutor<MarketPrice> {

    Optional<MarketPrice> findByMarketIdAndCropIdAndVarietyIdAndDate(Long marketId, Long cropId, Long varietyId, LocalDate date);

    @Query("SELECT mp FROM MarketPrice mp WHERE mp.crop.id = :cropId AND mp.market.id = :marketId " +
           "AND mp.date BETWEEN :startDate AND :endDate ORDER BY mp.date ASC")
    List<MarketPrice> findHistoricalPrices(
            @Param("cropId") Long cropId,
            @Param("marketId") Long marketId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT mp FROM MarketPrice mp WHERE mp.crop.id = :cropId " +
           "AND mp.date = (SELECT MAX(sub.date) FROM MarketPrice sub WHERE sub.crop.id = :cropId AND sub.market.id = mp.market.id)")
    List<MarketPrice> findLatestPricesForCrop(@Param("cropId") Long cropId);

    @Query("SELECT mp FROM MarketPrice mp WHERE mp.crop.id = :cropId AND mp.market.id = :marketId ORDER BY mp.date DESC")
    List<MarketPrice> findTopByCropIdAndMarketIdOrderByDateDesc(@Param("cropId") Long cropId, @Param("marketId") Long marketId, Pageable pageable);

    @Query("SELECT mp FROM MarketPrice mp WHERE mp.date = :date")
    Page<MarketPrice> findByDate(@Param("date") LocalDate date, Pageable pageable);
}
