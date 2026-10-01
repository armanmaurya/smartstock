package com.armanmaurya.inventory.repository;

import com.armanmaurya.inventory.entity.Location;
import com.armanmaurya.inventory.enums.LocationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {

    Optional<Location> findByCode(String code);

    List<Location> findByActiveTrue();

    List<Location> findByType(LocationType type);

    boolean existsByCode(String code);
}
