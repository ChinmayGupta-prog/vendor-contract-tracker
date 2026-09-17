package com.example.vendor_tracker.service;

import com.example.vendor_tracker.entity.Contract;
import com.example.vendor_tracker.entity.Vendor;
import com.example.vendor_tracker.repository.ContractRepository;
import com.example.vendor_tracker.repository.VendorRepository;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ContractService {

    private final ContractRepository contractRepository;
    private final VendorRepository vendorRepository;

    public ContractService(ContractRepository contractRepository, VendorRepository vendorRepository) {
        this.contractRepository = contractRepository;
        this.vendorRepository = vendorRepository;
    }

    public List<Contract> getAllContracts() {
        return contractRepository.findAll();
    }

    public Contract createContract(Long vendorId, Contract contract) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendor not found"));
        contract.setVendor(vendor);
        return contractRepository.save(contract);
    }

    public Contract updateContract(Long id, Long vendorId, Contract updatedContract) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found"));

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendor not found"));

        contract.setContractTitle(updatedContract.getContractTitle());
        contract.setStartDate(updatedContract.getStartDate());
        contract.setEndDate(updatedContract.getEndDate());
        contract.setContractValue(updatedContract.getContractValue());
        contract.setPaymentTerms(updatedContract.getPaymentTerms());
        contract.setStatus(updatedContract.getStatus());
        contract.setVendor(vendor);

        return contractRepository.save(contract);
    }

    public void deleteContract(Long id) {
        contractRepository.delete(contractRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found")));
    }
}