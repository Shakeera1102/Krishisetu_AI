package com.sih.marketlink.repository;

import com.sih.marketlink.entity.CropVariety;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CropVarietyRepository extends JpaRepository<CropVariety, Long> {
    List<CropVariety> findByCropId(Long cropId);
    Optional<CropVariety> findByCropIdAndNameIgnoreCase(Long cropId, String name);
}
