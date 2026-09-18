package com.apartment.backend.inspection;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One line of the inspection checklist, e.g. "Plumbing - Kitchen sink - Score 8
 * - Remarks: minor leak under sink".
 */
@Entity
@Table(name = "inspection_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InspectionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_id", nullable = false)
    private Inspection inspection;

    // e.g. "Structural", "Electrical", "Plumbing", "Aesthetic"
    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false, length = 300)
    private String description;

    // condition score 1-10 for this specific checklist item
    @Column(nullable = false)
    private Integer conditionScore;

    @Column(length = 500)
    private String remarks;
}
