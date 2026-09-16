package com.apartment.listing.dto;

import java.util.List;

public class ImageOrderRequestDto {

    private List<Long> imageIdsInOrder;

    public ImageOrderRequestDto() {}

    public List<Long> getImageIdsInOrder() {
        return imageIdsInOrder;
    }

    public void setImageIdsInOrder(List<Long> imageIdsInOrder) {
        this.imageIdsInOrder = imageIdsInOrder;
    }
}
