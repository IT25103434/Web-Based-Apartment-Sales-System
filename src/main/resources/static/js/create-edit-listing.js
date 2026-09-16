/* Form Logic: Create/Edit Listing, Image Previews & Media Pipeline Uploads */
const CreateEditListingView = {
    editingApartmentId: null,
    currentApartment: null,
    pendingImages: [], // Array of { id, file, previewUrl, isPrimary } for Add New Listing
    pendingFloorPlan: null, // File object for Add New Listing

    async load(apartmentId = null) {
        this.editingApartmentId = apartmentId;
        this.resetForm();

        await this.loadAmenities();

        if (apartmentId) {
            document.getElementById('form-page-title').textContent = 'Edit Apartment Listing';
            document.getElementById('form-page-subtitle').textContent = `Updating Listing #${apartmentId}`;
            await this.loadApartmentData(apartmentId);
        } else {
            document.getElementById('form-page-title').textContent = 'Add New Apartment Listing';
            document.getElementById('form-page-subtitle').textContent = 'Create a new apartment listing with all media assets';
        }

        this.setupDropzone();
    },

    resetForm() {
        // Cleanup object URLs for pending images
        if (this.pendingImages && this.pendingImages.length > 0) {
            this.pendingImages.forEach(img => {
                if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
            });
        }
        this.pendingImages = [];
        this.pendingFloorPlan = null;
        this.currentApartment = null;

        document.getElementById('listing-form').reset();
        document.getElementById('apartment-id-hidden').value = '';
        document.getElementById('image-previews-grid').innerHTML = '<p style="grid-column:1/-1; color:var(--text-secondary); font-size:13px; text-align:center;">No images uploaded yet.</p>';
        document.getElementById('floor-plan-status-box').innerHTML = '<p style="color:var(--text-secondary); font-size:13px;">No floor plan PDF uploaded yet.</p>';
        document.getElementById('virtual-tour-url').value = '';
        document.getElementById('virtual-tour-type').value = 'TOUR_360';
        document.getElementById('media-upload-section').style.display = 'block';

        // Reset amenity checkboxes styling
        document.querySelectorAll('input[name="amenityIds"]').forEach(cb => {
            cb.checked = false;
            this.toggleAmenityStyle(cb);
        });
    },

    async loadAmenities() {
        const container = document.getElementById('amenities-grid-container');
        if (!container) return;

        try {
            const amenities = await API.getAmenities();
            container.innerHTML = amenities.map(a => `
                <label class="amenity-checkbox" id="amenity-lbl-${a.amenityId}">
                    <input type="checkbox" name="amenityIds" value="${a.amenityId}" onchange="CreateEditListingView.toggleAmenityStyle(this)">
                    <span>${a.name}</span>
                </label>
            `).join('');
        } catch (error) {
            console.error('Failed to load amenities:', error);
        }
    },

    toggleAmenityStyle(checkbox) {
        const label = checkbox.closest('.amenity-checkbox');
        if (!label) return;
        if (checkbox.checked) {
            label.classList.add('checked');
        } else {
            label.classList.remove('checked');
        }
    },

    async loadApartmentData(id) {
        try {
            const apt = await API.getApartment(id);
            this.currentApartment = apt;

            document.getElementById('apartment-id-hidden').value = apt.apartmentId;
            document.getElementById('field-title').value = apt.title || '';
            document.getElementById('field-description').value = apt.description || '';
            document.getElementById('field-price').value = apt.price || '';
            document.getElementById('field-location').value = apt.location || '';
            document.getElementById('field-address').value = apt.address || '';
            document.getElementById('field-city').value = apt.city || '';
            document.getElementById('field-bedrooms').value = apt.bedrooms || 0;
            document.getElementById('field-bathrooms').value = apt.bathrooms || 0;
            document.getElementById('field-beds').value = apt.beds || 0;
            document.getElementById('field-size-sqft').value = apt.sizeSqft || '';

            // Check Amenities
            if (apt.amenities) {
                document.querySelectorAll('input[name="amenityIds"]').forEach(cb => {
                    const amenityName = cb.nextElementSibling.textContent;
                    if (apt.amenities.includes(amenityName)) {
                        cb.checked = true;
                        this.toggleAmenityStyle(cb);
                    }
                });
            }

            // Render Images
            this.renderImages(apt.images || []);

            // Render Floor Plan
            this.renderFloorPlan(apt.floorPlan);

            // Render Virtual Tour
            if (apt.virtualTour) {
                document.getElementById('virtual-tour-url').value = apt.virtualTour.tourUrl || '';
                document.getElementById('virtual-tour-type').value = apt.virtualTour.tourType || 'TOUR_360';
            }

        } catch (error) {
            App.showToast('Failed to load apartment details: ' + error.message, 'error');
        }
    },

    renderImages(images) {
        const container = document.getElementById('image-previews-grid');
        if (!container) return;

        if (!images || images.length === 0) {
            container.innerHTML = `<p style="grid-column:1/-1; color:var(--text-secondary); font-size:13px; text-align:center;">No images uploaded yet.</p>`;
            return;
        }

        container.innerHTML = images.map((img) => `
            <div class="preview-card ${img.primaryImage ? 'is-primary' : ''}" data-image-id="${img.imageId}">
                <img src="${img.thumbnailPath || img.imagePath}" alt="Apartment Image">
                ${img.primaryImage ? '<span class="primary-badge-label">COVER</span>' : ''}
                <div class="preview-actions">
                    ${!img.primaryImage ? `<button type="button" class="btn btn-secondary btn-sm" onclick="CreateEditListingView.setPrimaryImage(${img.imageId})">Set Cover</button>` : ''}
                    <button type="button" class="btn btn-danger btn-sm" onclick="CreateEditListingView.deleteImage(${img.imageId})">🗑️</button>
                </div>
            </div>
        `).join('');
    },

    renderPendingImages() {
        const container = document.getElementById('image-previews-grid');
        if (!container) return;

        if (!this.pendingImages || this.pendingImages.length === 0) {
            container.innerHTML = `<p style="grid-column:1/-1; color:var(--text-secondary); font-size:13px; text-align:center;">No images uploaded yet.</p>`;
            return;
        }

        container.innerHTML = this.pendingImages.map((img) => `
            <div class="preview-card ${img.isPrimary ? 'is-primary' : ''}" data-pending-id="${img.id}">
                <img src="${img.previewUrl}" alt="Pending Apartment Image">
                ${img.isPrimary ? '<span class="primary-badge-label">COVER</span>' : ''}
                <div class="preview-actions">
                    ${!img.isPrimary ? `<button type="button" class="btn btn-secondary btn-sm" onclick="CreateEditListingView.setPrimaryPendingImage('${img.id}')">Set Cover</button>` : ''}
                    <button type="button" class="btn btn-danger btn-sm" onclick="CreateEditListingView.deletePendingImage('${img.id}')">🗑️</button>
                </div>
            </div>
        `).join('');
    },

    renderFloorPlan(fp) {
        const box = document.getElementById('floor-plan-status-box');
        if (!box) return;

        if (fp && fp.filePath) {
            box.innerHTML = `
                <div style="display:flex; align-items:center; justify-content:space-between; background:var(--surface-hover); padding:12px; border-radius:8px; border:1px solid var(--border);">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:24px;">📄</span>
                        <div>
                            <strong style="font-size:14px;">${fp.fileName}</strong>
                            <div style="font-size:11px; color:var(--text-secondary);">PDF Floor Plan Uploaded</div>
                        </div>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="window.open('${fp.filePath}', '_blank')">View PDF</button>
                        <button type="button" class="btn btn-danger btn-sm" onclick="CreateEditListingView.deleteFloorPlan(${fp.floorPlanId})">Remove</button>
                    </div>
                </div>
            `;
        } else {
            box.innerHTML = `<p style="color:var(--text-secondary); font-size:13px;">No floor plan PDF uploaded yet.</p>`;
        }
    },

    renderPendingFloorPlan(file) {
        const box = document.getElementById('floor-plan-status-box');
        if (!box) return;

        if (file) {
            const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2);
            box.innerHTML = `
                <div style="display:flex; align-items:center; justify-content:space-between; background:var(--surface-hover); padding:12px; border-radius:8px; border:1px solid var(--border);">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:24px;">📄</span>
                        <div>
                            <strong style="font-size:14px;">${file.name}</strong>
                            <div style="font-size:11px; color:var(--text-secondary);">${fileSizeMb} MB - Selected for Upload</div>
                        </div>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button type="button" class="btn btn-danger btn-sm" onclick="CreateEditListingView.deletePendingFloorPlan()">Remove</button>
                    </div>
                </div>
            `;
        } else {
            box.innerHTML = `<p style="color:var(--text-secondary); font-size:13px;">No floor plan PDF uploaded yet.</p>`;
        }
    },

    setupDropzone() {
        const dropzone = document.getElementById('image-dropzone');
        const fileInput = document.getElementById('image-file-input');

        if (!dropzone || !fileInput) return;

        dropzone.onclick = () => fileInput.click();

        dropzone.ondragover = (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        };

        dropzone.ondragleave = () => dropzone.classList.remove('dragover');

        dropzone.ondrop = (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                this.handleImageFilesUpload(e.dataTransfer.files);
            }
        };

        fileInput.onchange = () => {
            if (fileInput.files.length) {
                this.handleImageFilesUpload(fileInput.files);
            }
        };
    },

    async handleImageFilesUpload(fileList) {
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        const maxSizeBytes = 10 * 1024 * 1024; // 10MB

        if (!this.editingApartmentId) {
            // Pending mode (Add New Listing)
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                const ext = file.name.split('.').pop().toLowerCase();
                
                if (!allowedExtensions.includes(ext)) {
                    App.showToast(`Invalid image file "${file.name}". Supported formats: JPG, JPEG, PNG, WebP.`, 'error');
                    continue;
                }
                if (file.size > maxSizeBytes) {
                    App.showToast(`Image "${file.name}" exceeds maximum size limit of 10MB.`, 'error');
                    continue;
                }

                const isFirst = this.pendingImages.length === 0;
                const pendingId = 'img_' + Date.now() + '_' + i;
                const previewUrl = URL.createObjectURL(file);

                this.pendingImages.push({
                    id: pendingId,
                    file: file,
                    previewUrl: previewUrl,
                    isPrimary: isFirst
                });
            }

            this.renderPendingImages();
            App.showToast(`${this.pendingImages.length} image(s) attached for saving.`, 'info');

        } else {
            // Edit mode (Upload immediately via API)
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                try {
                    App.showToast(`Uploading image ${i + 1}/${fileList.length}...`, 'info');
                    await API.uploadImage(this.editingApartmentId, file);
                } catch (error) {
                    App.showToast(`Image upload failed (${file.name}): ` + error.message, 'error');
                }
            }

            App.showToast('Image processing complete!', 'success');
            this.loadApartmentData(this.editingApartmentId);
        }
    },

    setPrimaryPendingImage(pendingId) {
        this.pendingImages.forEach(img => {
            img.isPrimary = (img.id === pendingId);
        });
        this.renderPendingImages();
        App.showToast('Cover image updated for pending listing.', 'info');
    },

    deletePendingImage(pendingId) {
        const idx = this.pendingImages.findIndex(img => img.id === pendingId);
        if (idx !== -1) {
            const removed = this.pendingImages.splice(idx, 1)[0];
            if (removed && removed.previewUrl) {
                URL.revokeObjectURL(removed.previewUrl);
            }
            if (removed.isPrimary && this.pendingImages.length > 0) {
                this.pendingImages[0].isPrimary = true;
            }
        }
        this.renderPendingImages();
        App.showToast('Image removed.', 'info');
    },

    async setPrimaryImage(imageId) {
        try {
            await API.setPrimaryImage(imageId);
            App.showToast('Cover image updated!', 'success');
            this.loadApartmentData(this.editingApartmentId);
        } catch (error) {
            App.showToast('Failed to set cover image: ' + error.message, 'error');
        }
    },

    async deleteImage(imageId) {
        try {
            await API.deleteImage(imageId);
            App.showToast('Image deleted successfully', 'success');
            this.loadApartmentData(this.editingApartmentId);
        } catch (error) {
            App.showToast('Failed to delete image: ' + error.message, 'error');
        }
    },

    async handleFloorPlanUpload(fileInput) {
        if (!fileInput.files || fileInput.files.length === 0) return;
        const file = fileInput.files[0];
        const ext = file.name.split('.').pop().toLowerCase();

        if (ext !== 'pdf') {
            App.showToast('Invalid file format. Only PDF documents are allowed for floor plans.', 'error');
            fileInput.value = '';
            return;
        }

        if (!this.editingApartmentId) {
            // Pending mode (Add New Listing)
            this.pendingFloorPlan = file;
            this.renderPendingFloorPlan(file);
            App.showToast('Floor plan PDF attached for saving.', 'info');
        } else {
            // Edit mode (Upload immediately via API)
            try {
                App.showToast('Uploading floor plan PDF...', 'info');
                await API.uploadFloorPlan(this.editingApartmentId, file);
                App.showToast('Floor plan PDF uploaded successfully!', 'success');
                this.loadApartmentData(this.editingApartmentId);
            } catch (error) {
                App.showToast('Floor plan upload failed: ' + error.message, 'error');
            }
        }
    },

    deletePendingFloorPlan() {
        this.pendingFloorPlan = null;
        const input = document.getElementById('floor-plan-input');
        if (input) input.value = '';
        this.renderPendingFloorPlan(null);
        App.showToast('Floor plan PDF removed.', 'info');
    },

    async deleteFloorPlan(floorPlanId) {
        try {
            await API.deleteFloorPlan(floorPlanId);
            App.showToast('Floor plan deleted', 'success');
            this.loadApartmentData(this.editingApartmentId);
        } catch (error) {
            App.showToast('Failed to delete floor plan: ' + error.message, 'error');
        }
    },

    async handleVirtualTourSave() {
        const tourUrl = document.getElementById('virtual-tour-url').value.trim();
        const tourType = document.getElementById('virtual-tour-type').value;

        if (!tourUrl) {
            App.showToast('Please enter a valid virtual tour URL.', 'error');
            return;
        }

        if (!tourUrl.toLowerCase().startsWith('http://') && !tourUrl.toLowerCase().startsWith('https://')) {
            App.showToast('Virtual tour URL must start with http:// or https://', 'error');
            return;
        }

        if (!this.editingApartmentId) {
            App.showToast('Virtual tour link attached for saving.', 'info');
        } else {
            try {
                await API.addOrUpdateVirtualTour(this.editingApartmentId, tourUrl, tourType);
                App.showToast('Virtual tour saved successfully!', 'success');
                this.loadApartmentData(this.editingApartmentId);
            } catch (error) {
                App.showToast('Failed to save virtual tour: ' + error.message, 'error');
            }
        }
    },

    async submitForm(targetStatus = 'AVAILABLE') {
        const title = document.getElementById('field-title').value.trim();
        const price = document.getElementById('field-price').value;
        const location = document.getElementById('field-location').value.trim();
        const sizeSqft = document.getElementById('field-size-sqft').value;

        if (!title) {
            App.showToast('Title is required to save listing', 'error');
            return;
        }

        if (targetStatus === 'AVAILABLE') {
            if (!price || parseFloat(price) <= 0) {
                App.showToast('A valid positive price is required to publish listing', 'error');
                return;
            }
            if (!location) {
                App.showToast('Location is required to publish listing', 'error');
                return;
            }
            if (!sizeSqft || parseInt(sizeSqft, 10) <= 0) {
                App.showToast('Size (sqft) is required to publish listing', 'error');
                return;
            }
        }

        const selectedAmenityIds = Array.from(document.querySelectorAll('input[name="amenityIds"]:checked'))
            .map(cb => parseInt(cb.value, 10));

        const payload = {
            title: title,
            description: document.getElementById('field-description').value.trim(),
            price: price ? parseFloat(price) : null,
            location: location,
            address: document.getElementById('field-address').value.trim(),
            city: document.getElementById('field-city').value.trim(),
            bedrooms: parseInt(document.getElementById('field-bedrooms').value, 10) || 0,
            bathrooms: parseInt(document.getElementById('field-bathrooms').value, 10) || 0,
            beds: parseInt(document.getElementById('field-beds').value, 10) || 0,
            sizeSqft: sizeSqft ? parseInt(sizeSqft, 10) : null,
            status: targetStatus,
            amenityIds: selectedAmenityIds
        };

        try {
            if (this.editingApartmentId) {
                // Update existing listing
                await API.updateApartment(this.editingApartmentId, payload);

                // Save virtual tour if URL is present
                const tourUrl = document.getElementById('virtual-tour-url').value.trim();
                const tourType = document.getElementById('virtual-tour-type').value;
                if (tourUrl && (tourUrl.toLowerCase().startsWith('http://') || tourUrl.toLowerCase().startsWith('https://'))) {
                    await API.addOrUpdateVirtualTour(this.editingApartmentId, tourUrl, tourType);
                }

                App.showToast(`Listing ${targetStatus === 'AVAILABLE' ? 'published' : 'updated'} successfully!`, 'success');

            } else {
                // Add New Listing: Create apartment in DB first, then attach pending media
                App.showToast('Saving apartment listing and attaching media assets...', 'info');

                const created = await API.createApartment(payload);
                const createdId = created.apartmentId;

                // 1. Upload pending images in order
                if (this.pendingImages && this.pendingImages.length > 0) {
                    for (let i = 0; i < this.pendingImages.length; i++) {
                        const imgObj = this.pendingImages[i];
                        try {
                            await API.uploadImage(createdId, imgObj.file, imgObj.isPrimary);
                        } catch (err) {
                            console.error(`Failed to upload pending image ${imgObj.file.name}:`, err);
                        }
                    }
                }

                // 2. Upload pending floor plan PDF
                if (this.pendingFloorPlan) {
                    try {
                        await API.uploadFloorPlan(createdId, this.pendingFloorPlan);
                    } catch (err) {
                        console.error('Failed to upload pending floor plan:', err);
                    }
                }

                // 3. Attach virtual tour URL
                const tourUrl = document.getElementById('virtual-tour-url').value.trim();
                const tourType = document.getElementById('virtual-tour-type').value;
                if (tourUrl && (tourUrl.toLowerCase().startsWith('http://') || tourUrl.toLowerCase().startsWith('https://'))) {
                    try {
                        await API.addOrUpdateVirtualTour(createdId, tourUrl, tourType);
                    } catch (err) {
                        console.error('Failed to save virtual tour:', err);
                    }
                }

                App.showToast(`Apartment listing created and published successfully!`, 'success');
            }

            // Cleanup & navigate back to listings
            this.resetForm();
            App.navigateTo('my-listings');

        } catch (error) {
            App.showToast(`Save failed: ${error.message}`, 'error');
        }
    }
};
