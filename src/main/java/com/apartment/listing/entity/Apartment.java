package com.apartment.listing.entity;

import com.apartment.listing.enums.ListingStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "apartments")
public class Apartment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "apartment_id")
    private Long apartmentId;

    @Column(name = "agent_id", nullable = false)
    private Long agentId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "price", nullable = false, precision = 18, scale = 2)
    private BigDecimal price;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "bedrooms")
    private Integer bedrooms;

    @Column(name = "bathrooms")
    private Integer bathrooms;

    @Column(name = "beds")
    private Integer beds;

    @Column(name = "size_sqft")
    private Integer sizeSqft;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ListingStatus status = ListingStatus.DRAFT;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "apartment", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, imageId ASC")
    private List<ApartmentImage> images = new ArrayList<>();

    @OneToOne(mappedBy = "apartment", cascade = CascadeType.ALL, orphanRemoval = true)
    private FloorPlan floorPlan;

    @OneToOne(mappedBy = "apartment", cascade = CascadeType.ALL, orphanRemoval = true)
    private VirtualTour virtualTour;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "apartment_amenities",
        joinColumns = @JoinColumn(name = "apartment_id"),
        inverseJoinColumns = @JoinColumn(name = "amenity_id")
    )
    private Set<Amenity> amenities = new HashSet<>();

    public Apartment() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = ListingStatus.DRAFT;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Convenience methods
    public void addImage(ApartmentImage image) {
        images.add(image);
        image.setApartment(this);
    }

    public void removeImage(ApartmentImage image) {
        images.remove(image);
        image.setApartment(null);
    }

    public void setFloorPlan(FloorPlan floorPlan) {
        if (floorPlan == null) {
            if (this.floorPlan != null) {
                this.floorPlan.setApartment(null);
            }
        } else {
            floorPlan.setApartment(this);
        }
        this.floorPlan = floorPlan;
    }

    public void setVirtualTour(VirtualTour virtualTour) {
        if (virtualTour == null) {
            if (this.virtualTour != null) {
                this.virtualTour.setApartment(null);
            }
        } else {
            virtualTour.setApartment(this);
        }
        this.virtualTour = virtualTour;
    }

    // Getters and Setters
    public Long getApartmentId() {
        return apartmentId;
    }

    public void setApartmentId(Long apartmentId) {
        this.apartmentId = apartmentId;
    }

    public Long getAgentId() {
        return agentId;
    }

    public void setAgentId(Long agentId) {
        this.agentId = agentId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public Integer getBedrooms() {
        return bedrooms;
    }

    public void setBedrooms(Integer bedrooms) {
        this.bedrooms = bedrooms;
    }

    public Integer getBathrooms() {
        return bathrooms;
    }

    public void setBathrooms(Integer bathrooms) {
        this.bathrooms = bathrooms;
    }

    public Integer getBeds() {
        return beds;
    }

    public void setBeds(Integer beds) {
        this.beds = beds;
    }

    public Integer getSizeSqft() {
        return sizeSqft;
    }

    public void setSizeSqft(Integer sizeSqft) {
        this.sizeSqft = sizeSqft;
    }

    public ListingStatus getStatus() {
        return status;
    }

    public void setStatus(ListingStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<ApartmentImage> getImages() {
        return images;
    }

    public void setImages(List<ApartmentImage> images) {
        this.images = images;
    }

    public FloorPlan getFloorPlan() {
        return floorPlan;
    }

    public VirtualTour getVirtualTour() {
        return virtualTour;
    }

    public Set<Amenity> getAmenities() {
        return amenities;
    }

    public void setAmenities(Set<Amenity> amenities) {
        this.amenities = amenities;
    }
}
