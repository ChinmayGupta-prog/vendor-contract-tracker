package com.example.vendor_tracker.repository;

import com.example.vendor_tracker.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContractRepository extends JpaRepository<Contract, Long> {
}