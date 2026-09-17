package com.example.vendor_tracker;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import com.example.vendor_tracker.entity.Vendor;
import com.example.vendor_tracker.repository.VendorRepository;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@Transactional
class ApiRegressionTests {
    @Autowired WebApplicationContext context;
    @Autowired VendorRepository vendors;
    MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context).dispatchOptions(true).build();
    }

    private Long vendor() {
        Vendor vendor = new Vendor();
        vendor.setCompanyName("Regression test vendor");
        return vendors.saveAndFlush(vendor).getId();
    }

    @Test
    void rejectsBlankVendorAndInvalidEmail() throws Exception {
        mvc.perform(post("/api/vendors").contentType("application/json").content("{}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").value("Company name is required"));
        mvc.perform(post("/api/vendors").contentType("application/json")
                .content("{\"companyName\":\"Company\",\"email\":\"invalid\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejectsInvalidContractsOnCreateAndUpdate() throws Exception {
        Long vendorId = vendor();
        for (String body : new String[] {
                "{\"contractTitle\":\"   \"}",
                "{\"contractTitle\":\"Test\",\"contractValue\":-1}",
                "{\"contractTitle\":\"Test\",\"startDate\":\"2026-02-01\",\"endDate\":\"2026-01-01\"}"
        }) {
            mvc.perform(post("/api/contracts/vendor/" + vendorId).contentType("application/json").content(body))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").isNotEmpty());
            mvc.perform(put("/api/contracts/1/vendor/" + vendorId).contentType("application/json").content(body))
                    .andExpect(status().isBadRequest());
        }
    }

    @Test
    void acceptsZeroValueAndSameDayDates() throws Exception {
        mvc.perform(post("/api/contracts/vendor/" + vendor()).contentType("application/json")
                .content("{\"contractTitle\":\"Test\",\"contractValue\":0,\"startDate\":\"2026-01-01\",\"endDate\":\"2026-01-01\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.contractValue").value(0));
    }

    @Test
    void missingRecordsReturn404() throws Exception {
        mvc.perform(get("/api/vendors/9223372036854775807")).andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Vendor not found"));
        mvc.perform(delete("/api/vendors/9223372036854775807")).andExpect(status().isNotFound());
        mvc.perform(delete("/api/contracts/9223372036854775807")).andExpect(status().isNotFound());
        mvc.perform(post("/api/contracts/vendor/9223372036854775807").contentType("application/json")
                .content("{\"contractTitle\":\"Test\"}")).andExpect(status().isNotFound());
    }

    @Test
    void malformedValuesReturnHelpful400() throws Exception {
        mvc.perform(post("/api/contracts/vendor/" + vendor()).contentType("application/json")
                .content("{\"contractTitle\":\"Test\",\"contractValue\":\"abc\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    void allowsSupportedLocalOrigins() throws Exception {
        for (String origin : new String[] {"http://localhost:5173", "http://localhost:5174",
                "http://localhost:4173", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:4173"}) {
            for (String endpoint : new String[] {"/api/vendors", "/api/contracts/vendor/1"}) {
                mvc.perform(options(endpoint).header("Origin", origin)
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type"))
                        .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin", origin));
            }
        }
    }
}
