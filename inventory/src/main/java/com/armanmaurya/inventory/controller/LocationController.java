package com.armanmaurya.inventory.controller;

import com.armanmaurya.inventory.entity.Location;
import com.armanmaurya.inventory.exception.BusinessException;
import com.armanmaurya.inventory.exception.ResourceNotFoundException;
import com.armanmaurya.inventory.repository.LocationRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "*")
public class LocationController {

    private final LocationRepository locationRepository;

    public LocationController(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    @GetMapping
    public ResponseEntity<List<Location>> getAllLocations() {
        return ResponseEntity.ok(locationRepository.findAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Location>> getActiveLocations() {
        return ResponseEntity.ok(locationRepository.findByActiveTrue());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Location> getLocationById(@PathVariable Long id) {
        return locationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));
    }

    @PostMapping
    public ResponseEntity<Location> createLocation(@Valid @RequestBody Location location) {
        if (locationRepository.existsByCode(location.getCode())) {
            throw new BusinessException("Location with code '" + location.getCode() + "' already exists.");
        }
        Location saved = locationRepository.save(location);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Location> updateLocation(@PathVariable Long id, @Valid @RequestBody Location updated) {
        Location existing = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));

        if (!existing.getCode().equalsIgnoreCase(updated.getCode()) && locationRepository.existsByCode(updated.getCode())) {
            throw new BusinessException("Location with code '" + updated.getCode() + "' already exists.");
        }

        existing.setCode(updated.getCode());
        existing.setName(updated.getName());
        existing.setType(updated.getType());
        existing.setAddress(updated.getAddress());
        existing.setCity(updated.getCity());
        existing.setState(updated.getState());
        existing.setPostalCode(updated.getPostalCode());
        existing.setPhone(updated.getPhone());
        existing.setEmail(updated.getEmail());
        existing.setActive(updated.isActive());

        return ResponseEntity.ok(locationRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocation(@PathVariable Long id) {
        Location existing = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));
        existing.setActive(false);
        locationRepository.save(existing);
        return ResponseEntity.noContent().build();
    }
}
