package com.example.vendor_tracker.controller;

import com.example.vendor_tracker.entity.Contract;
import com.example.vendor_tracker.service.ContractService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class ContractController {

    private final ContractService contractService;

    public ContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    @GetMapping
    public List<Contract> getAllContracts() {
        return contractService.getAllContracts();
    }

    @PostMapping("/vendor/{vendorId}")
    public Contract createContract(@PathVariable Long vendorId, @RequestBody Contract contract) {
        return contractService.createContract(vendorId, contract);
    }

    @PutMapping("/{id}/vendor/{vendorId}")
    public Contract updateContract(
            @PathVariable Long id,
            @PathVariable Long vendorId,
            @RequestBody Contract contract) {
        return contractService.updateContract(id, vendorId, contract);
    }

    @DeleteMapping("/{id}")
    public void deleteContract(@PathVariable Long id) {
        contractService.deleteContract(id);
    }
}