package com.sih.marketlink.repository;

import com.sih.marketlink.entity.Offer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {

    List<Offer> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
    List<Offer> findByFarmerIdAndStatusOrderByCreatedAtDesc(Long farmerId, String status);

    List<Offer> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
    List<Offer> findByBuyerIdAndStatusOrderByCreatedAtDesc(Long buyerId, String status);

    Page<Offer> findByFarmerId(Long farmerId, Pageable pageable);
    Page<Offer> findByBuyerId(Long buyerId, Pageable pageable);

    long countByFarmerIdAndStatus(Long farmerId, String status);
    long countByBuyerIdAndStatus(Long buyerId, String status);
}
