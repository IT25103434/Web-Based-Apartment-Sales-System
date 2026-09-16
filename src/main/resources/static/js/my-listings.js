/* My Listings Filter, Search, and Status Transition Controller */
const MyListingsView = {
    currentStatusFilter: 'ALL',
    searchDebounceTimer: null,

    initListeners() {
        // Filter Buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentStatusFilter = btn.dataset.status;
                this.fetchAndRenderListings();
            });
        });

        // Search Input
        const searchInput = document.getElementById('listings-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                clearTimeout(this.searchDebounceTimer);
                this.searchDebounceTimer = setTimeout(() => {
                    this.fetchAndRenderListings();
                }, 300);
            });
        }
    },

    async load(statusFilter = 'ALL') {
        this.currentStatusFilter = statusFilter;
        this.initListeners();

        // Highlight correct filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            if (btn.dataset.status === statusFilter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        await this.fetchAndRenderListings();
    },

    async fetchAndRenderListings() {
        const grid = document.getElementById('my-listings-grid');
        if (!grid) return;

        grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:40px;">Loading agent listings...</div>`;

        const query = document.getElementById('listings-search-input')?.value || '';

        try {
            const listings = await API.getListings(this.currentStatusFilter, query);
            this.renderListings(listings);
        } catch (error) {
            App.showToast('Error loading listings: ' + error.message, 'error');
            grid.innerHTML = `<div class="empty-state"><h3>Failed to load listings</h3><p>${error.message}</p></div>`;
        }
    },

    renderListings(listings) {
        const grid = document.getElementById('my-listings-grid');
        if (!grid) return;

        if (!listings || listings.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🏢</div>
                    <h3>No Apartment Listings Found</h3>
                    <p>No listings match your filter criteria or search query.</p>
                    <button class="btn btn-primary" onclick="App.navigateTo('create-listing')">+ Add New Apartment</button>
                </div>
            `;
            return;
        }

        grid.innerHTML = listings.map(apt => {
            const coverImg = apt.primaryThumbnailPath || apt.primaryImagePath || '/images/placeholder-apartment.jpg';
            const createdDate = apt.createdAt ? new Date(apt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently';

            return `
                <div class="apartment-card" id="apartment-card-${apt.apartmentId}">
                    <div class="card-media">
                        <img src="${coverImg}" alt="${apt.title}" onerror="this.src='/images/placeholder-apartment.jpg'">
                        <div class="card-status-badge">${App.formatStatusBadge(apt.status)}</div>
                        <div class="card-price-tag">${App.formatPrice(apt.price)}</div>
                    </div>
                    <div class="card-content">
                        <h3 class="card-title">${apt.title}</h3>
                        <div class="card-location">📍 ${apt.location || 'Location Not Specified'}</div>
                        
                        <div class="card-features">
                            <div class="feature-item">🛏️ ${apt.bedrooms || 0} Beds</div>
                            <div class="feature-item">🚿 ${apt.bathrooms || 0} Baths</div>
                            <div class="feature-item">📐 ${apt.sizeSqft || 0} sqft</div>
                        </div>

                        <div style="font-size:11px; color:var(--text-light); margin-bottom:12px;">Created: ${createdDate}</div>

                        <div class="card-actions">
                            <select onchange="MyListingsView.changeStatus(${apt.apartmentId}, this.value)" title="Change Listing Status">
                                <option value="DRAFT" ${apt.status === 'DRAFT' ? 'selected' : ''}>Status: Draft</option>
                                <option value="AVAILABLE" ${apt.status === 'AVAILABLE' ? 'selected' : ''}>Status: Available</option>
                                <option value="RESERVED" ${apt.status === 'RESERVED' ? 'selected' : ''}>Status: Reserved</option>
                                <option value="SOLD" ${apt.status === 'SOLD' ? 'selected' : ''}>Status: Sold</option>
                            </select>

                            <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('listing-details', {apartmentId: ${apt.apartmentId}})">View</button>
                            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('create-listing', {apartmentId: ${apt.apartmentId}})">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="MyListingsView.confirmDelete(${apt.apartmentId}, '${apt.title.replace(/'/g, "\\'")}')">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    async changeStatus(apartmentId, newStatus) {
        try {
            await API.updateStatus(apartmentId, newStatus);
            App.showToast(`Listing status updated to ${newStatus}`, 'success');
            this.fetchAndRenderListings();
        } catch (error) {
            App.showToast('Status update failed: ' + error.message, 'error');
            this.fetchAndRenderListings(); // reset dropdown selection
        }
    },

    async confirmDelete(apartmentId, title) {
        if (confirm(`Are you sure you want to delete "${title}"? All associated images and floor plans will be permanently removed.`)) {
            try {
                await API.deleteApartment(apartmentId);
                App.showToast('Listing deleted successfully', 'success');
                this.fetchAndRenderListings();
            } catch (error) {
                App.showToast('Delete failed: ' + error.message, 'error');
            }
        }
    }
};
