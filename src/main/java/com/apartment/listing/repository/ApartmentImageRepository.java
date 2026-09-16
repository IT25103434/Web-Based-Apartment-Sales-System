package com.apartment.listing.repository;

import com.apartment.listing.entity.ApartmentImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApartmentImageRepository extends JpaRepository<ApartmentImage, Long> {

    List<ApartmentImage> findByApartmentApartmentIdOrderByDisplayOrderAscImageIdAsc(Long apartmentId);

    @Modifying
    @Query("UPDATE ApartmentImage img SET img.primaryImage = false WHERE img.apartment.apartmentId = :apartmentId")
    void resetPrimaryImageForApartment(@Param("apartmentId") Long apartmentId);
}
