package com.example.vendor_tracker.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
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

    @NotBlank(message = "Contract title is required")
    private String contractTitle;
    private LocalDate startDate;
    private LocalDate endDate;
    @PositiveOrZero(message = "Contract value cannot be negative")
    private BigDecimal contractValue;
    private String paymentTerms;
    private String status;

    @ManyToOne
    @JoinColumn(name = "vendor_id")
    @JsonIgnoreProperties("contracts")
    private Vendor vendor;

    @AssertTrue(message = "End date must be on or after start date")
    @com.fasterxml.jackson.annotation.JsonIgnore
    public boolean isDateRangeValid() {
        return startDate == null || endDate == null || !endDate.isBefore(startDate);
    }
}
