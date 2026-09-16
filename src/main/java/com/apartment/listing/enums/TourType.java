package com.apartment.listing.enums;

public enum TourType {
    TOUR_360("360° Virtual Tour"),
    TOUR_3D("3D Interactive Model"),
    VIDEO_TOUR("Video Walkthrough"),
    OTHER("External Link");

    private final String displayName;

    TourType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
