package com.example.vendor_tracker.controller;

import com.example.vendor_tracker.entity.Vendor;
import com.example.vendor_tracker.service.VendorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/vendors")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:4173", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:4173"})
public class VendorController {

    private final VendorService vendorService;

    public VendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    @GetMapping
    public List<Vendor> getAllVendors() {
        return vendorService.getAllVendors();
    }

    @GetMapping("/{id}")
    public Vendor getVendorById(@PathVariable Long id) {
        return vendorService.getVendorById(id);
    }

    @PostMapping
    public Vendor createVendor(@Valid @RequestBody Vendor vendor) {
        return vendorService.createVendor(vendor);
    }

    @PutMapping("/{id}")
    public Vendor updateVendor(@PathVariable Long id, @Valid @RequestBody Vendor vendor) {
        return vendorService.updateVendor(id, vendor);
    }

    @DeleteMapping("/{id}")
    public void deleteVendor(@PathVariable Long id) {
        vendorService.deleteVendor(id);
    }
}