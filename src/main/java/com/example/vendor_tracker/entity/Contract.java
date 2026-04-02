package com.example.vendor_tracker.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "contracts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String contractTitle;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal contractValue;
    private String paymentTerms;
    private String status;

    @ManyToOne
    @JoinColumn(name = "vendor_id")
    @JsonIgnoreProperties("contracts")
    private Vendor vendor;
}