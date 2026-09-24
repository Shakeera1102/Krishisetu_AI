package com.sih.marketlink.repository;

import com.sih.marketlink.entity.BuyerRequirement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BuyerRequirementRepository extends JpaRepository<BuyerRequirement, Long>, JpaSpecificationExecutor<BuyerRequirement> {

    List<BuyerRequirement> findByBuyerId(Long buyerId);
    List<BuyerRequirement> findByBuyerIdAndStatus(Long buyerId, String status);

    @Query("SELECT br FROM BuyerRequirement br WHERE br.status = 'ACTIVE' AND br.crop.id = :cropId")
    List<BuyerRequirement> findActiveByCropId(@Param("cropId") Long cropId);

    @Query("SELECT br FROM BuyerRequirement br WHERE br.status = 'ACTIVE'")
    List<BuyerRequirement> findAllActive();

    long countByBuyerIdAndStatus(Long buyerId, String status);
}
