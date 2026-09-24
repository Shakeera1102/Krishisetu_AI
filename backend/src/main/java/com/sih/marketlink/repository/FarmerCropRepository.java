package com.sih.marketlink.repository;

import com.sih.marketlink.entity.FarmerCrop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FarmerCropRepository extends JpaRepository<FarmerCrop, Long> {

    List<FarmerCrop> findByFarmerId(Long farmerId);
    List<FarmerCrop> findByFarmerIdAndStatus(Long farmerId, String status);

    @Query("SELECT fc FROM FarmerCrop fc WHERE fc.status = 'AVAILABLE' AND fc.crop.id = :cropId")
    List<FarmerCrop> findAvailableByCropId(@Param("cropId") Long cropId);

    @Query("SELECT fc FROM FarmerCrop fc WHERE fc.status = 'AVAILABLE'")
    List<FarmerCrop> findAllAvailable();
}
