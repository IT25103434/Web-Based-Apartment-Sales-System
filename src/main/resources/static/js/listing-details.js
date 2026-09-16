/* Listing Details View Controller (Gallery Lightbox, PDF Viewer & Virtual Tour) */
const ListingDetailsView = {
    currentApartment: null,

    async load(apartmentId) {
        if (!apartmentId) {
            App.navigateTo('my-listings');
            return;
        }

        try {
            const apt = await API.getApartment(apartmentId);
            this.currentApartment = apt;
            this.renderDetails(apt);
        } catch (error) {
            App.showToast('Error loading apartment details: ' + error.message, 'error');
            App.navigateTo('my-listings');
        }
    },

    renderDetails(apt) {
        document.getElementById('details-title-text').textContent = apt.title;
        document.getElementById('details-location-text').textContent = `📍 ${apt.address || ''} ${apt.location || ''}, ${apt.city || ''}`;
        document.getElementById('details-price-text').textContent = App.formatPrice(apt.price);
        document.getElementById('details-status-badge').innerHTML = App.formatStatusBadge(apt.status);
        document.getElementById('details-description-text').textContent = apt.description || 'No description provided.';
        document.getElementById('details-agent-name').textContent = apt.agentName || `Agent #${apt.agentId}`;

        // Specs Bar
        document.getElementById('spec-bedrooms').textContent = apt.bedrooms || 0;
        document.getElementById('spec-bathrooms').textContent = apt.bathrooms || 0;
        document.getElementById('spec-beds').textContent = apt.beds || 0;
        document.getElementById('spec-sqft').textContent = apt.sizeSqft || 0;

        // Amenities
        const amenitiesBox = document.getElementById('details-amenities-tags');
        if (apt.amenities && apt.amenities.length > 0) {
            amenitiesBox.innerHTML = apt.amenities.map(name => `<span class="amenity-tag">✓ ${name}</span>`).join('');
        } else {
            amenitiesBox.innerHTML = `<span style="color:var(--text-secondary); font-size:13px;">No amenities selected for this apartment.</span>`;
        }

        // Render Gallery
        this.renderGallery(apt.images || []);

        // Media Action Buttons
        const mediaActionsBox = document.getElementById('details-media-actions');
        let mediaHtml = '';

        if (apt.floorPlan) {
            mediaHtml += `
                <button type="button" class="btn btn-secondary" style="width:100%; justify-content:flex-start;" onclick="ListingDetailsView.openFloorPlanModal('${apt.floorPlan.filePath}', '${apt.floorPlan.fileName.replace(/'/g, "\\'")}')">
                    <span>📄</span> View Floor Plan (PDF)
                </button>
            `;
        } else {
            mediaHtml += `<div style="font-size:13px; color:var(--text-secondary);">No floor plan uploaded.</div>`;
        }

        if (apt.virtualTour) {
            const tourTypeLabel = apt.virtualTour.tourType || '3D Virtual Tour';
            mediaHtml += `
                <button type="button" class="btn btn-primary" style="width:100%; justify-content:flex-start; margin-top:8px;" onclick="ListingDetailsView.openVirtualTourModal('${apt.virtualTour.tourUrl.replace(/'/g, "\\'")}', '${tourTypeLabel}')">
                    <span>🌐</span> Launch ${tourTypeLabel}
                </button>
            `;
        } else {
            mediaHtml += `<div style="font-size:13px; color:var(--text-secondary); margin-top:4px;">No virtual tour added.</div>`;
        }

        mediaActionsBox.innerHTML = mediaHtml;

        // Action Buttons for listing management
        document.getElementById('details-edit-btn').onclick = () => App.navigateTo('create-listing', { apartmentId: apt.apartmentId });
    },

    renderGallery(images) {
        const container = document.getElementById('details-gallery-container');
        if (!container) return;

        if (!images || images.length === 0) {
            container.innerHTML = `
                <div style="grid-column:1/-1; height:300px; background:var(--bg-card); display:flex; align-items:center; justify-content:center; color:#fff; border-radius:12px;">
                    No photos uploaded for this apartment.
                </div>
            `;
            return;
        }

        const mainImg = images[0].imagePath;
        const subImg1 = images[1] ? images[1].imagePath : images[0].imagePath;
        const subImg2 = images[2] ? images[2].imagePath : (images[1] ? images[1].imagePath : images[0].imagePath);
        const extraCount = images.length > 3 ? images.length - 3 : 0;

        container.innerHTML = `
            <div class="gallery-main" onclick="ListingDetailsView.openLightbox(0)">
                <img src="${mainImg}" alt="Main Cover" onerror="this.src='/images/placeholder-apartment.jpg'">
            </div>
            <div class="gallery-sub">
                <div class="gallery-sub-item" onclick="ListingDetailsView.openLightbox(1)">
                    <img src="${subImg1}" alt="Sub Photo 1" onerror="this.src='/images/placeholder-apartment.jpg'">
                </div>
                <div class="gallery-sub-item" onclick="ListingDetailsView.openLightbox(2)">
                    <img src="${subImg2}" alt="Sub Photo 2" onerror="this.src='/images/placeholder-apartment.jpg'">
                    ${extraCount > 0 ? `<div class="more-images-overlay">+${extraCount} More Photos</div>` : ''}
                </div>
            </div>
        `;
    },

    openLightbox(index) {
        if (!this.currentApartment || !this.currentApartment.images || this.currentApartment.images.length === 0) return;
        const img = this.currentApartment.images[index] || this.currentApartment.images[0];

        const modalBody = document.getElementById('lightbox-modal-body');
        modalBody.innerHTML = `
            <div style="text-align:center;">
                <img src="${img.imagePath}" style="max-width:100%; max-height:75vh; border-radius:8px; object-fit:contain;">
                <div style="margin-top:12px; color:var(--text-secondary); font-size:14px;">Photo ${index + 1} of ${this.currentApartment.images.length}</div>
            </div>
        `;
        App.openModal('modal-lightbox');
    },

    openFloorPlanModal(pdfUrl, fileName) {
        const titleEl = document.getElementById('modal-floorplan-title');
        const bodyEl = document.getElementById('modal-floorplan-body');

        if (titleEl) titleEl.textContent = `Floor Plan - ${fileName}`;
        if (bodyEl) {
            bodyEl.innerHTML = `
                <div style="height:70vh;">
                    <iframe src="${pdfUrl}" style="width:100%; height:100%; border:none; border-radius:8px;"></iframe>
                </div>
            `;
        }
        App.openModal('modal-floorplan');
    },

    openVirtualTourModal(tourUrl, tourTypeLabel) {
        const titleEl = document.getElementById('modal-tour-title');
        const bodyEl = document.getElementById('modal-tour-body');

        if (titleEl) titleEl.textContent = `Virtual Tour - ${tourTypeLabel}`;
        if (bodyEl) {
            bodyEl.innerHTML = `
                <div style="text-align:center; padding:20px;">
                    <p style="margin-bottom:16px; color:var(--text-secondary);">External Virtual Tour URL:</p>
                    <a href="${tourUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="margin-bottom:20px;">
                        🔗 Open Tour in New Tab
                    </a>
                    <div style="height:55vh; border:1px solid var(--border); border-radius:8px; overflow:hidden;">
                        <iframe src="${tourUrl}" style="width:100%; height:100%; border:none;" allowfullscreen></iframe>
                    </div>
                </div>
            `;
        }
        App.openModal('modal-virtual-tour');
    }
};
