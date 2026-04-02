package com.example.vendor_tracker.repository;

import com.example.vendor_tracker.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VendorRepository extends JpaRepository<Vendor, Long> {
}