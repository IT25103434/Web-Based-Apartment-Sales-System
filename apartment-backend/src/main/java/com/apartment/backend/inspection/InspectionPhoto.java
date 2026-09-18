package com.apartment.backend.inspection;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "inspection_photos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InspectionPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_id", nullable = false)
    private Inspection inspection;

    @Column(nullable = false, length = 300)
    private String photoUrl;

    @Column(length = 200)
    private String caption;
}
