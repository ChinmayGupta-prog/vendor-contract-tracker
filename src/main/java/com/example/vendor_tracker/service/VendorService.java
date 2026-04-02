package com.example.vendor_tracker.service;

import com.example.vendor_tracker.entity.Vendor;
import com.example.vendor_tracker.repository.VendorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VendorService {

    private final VendorRepository vendorRepository;

    public VendorService(VendorRepository vendorRepository) {
        this.vendorRepository = vendorRepository;
    }

    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    public Vendor getVendorById(Long id) {
        return vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
    }

    public Vendor createVendor(Vendor vendor) {
        return vendorRepository.save(vendor);
    }

    public Vendor updateVendor(Long id, Vendor updatedVendor) {
        Vendor vendor = getVendorById(id);
        vendor.setCompanyName(updatedVendor.getCompanyName());
        vendor.setContactPerson(updatedVendor.getContactPerson());
        vendor.setEmail(updatedVendor.getEmail());
        vendor.setPhone(updatedVendor.getPhone());
        vendor.setCategory(updatedVendor.getCategory());
        vendor.setCity(updatedVendor.getCity());
        vendor.setStatus(updatedVendor.getStatus());
        return vendorRepository.save(vendor);
    }

    public void deleteVendor(Long id) {
        vendorRepository.deleteById(id);
    }
}