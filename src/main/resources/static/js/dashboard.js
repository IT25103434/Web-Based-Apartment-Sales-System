/* Dashboard Statistics & Overview Renderer */
const DashboardView = {
    async load() {
        try {
            const stats = await API.getDashboardStats();
            this.renderStats(stats);

            const recentListings = await API.getListings('', '');
            this.renderRecentListings(recentListings.slice(0, 5));
        } catch (error) {
            App.showToast('Failed to load dashboard data: ' + error.message, 'error');
        }
    },

    renderStats(stats) {
        document.getElementById('stat-total-count').textContent = stats.totalListings || 0;
        document.getElementById('stat-draft-count').textContent = stats.draftListings || 0;
        document.getElementById('stat-available-count').textContent = stats.availableListings || 0;
        document.getElementById('stat-reserved-count').textContent = stats.reservedListings || 0;
        document.getElementById('stat-sold-count').textContent = stats.soldListings || 0;
    },

    renderRecentListings(listings) {
        const tbody = document.getElementById('recent-listings-tbody');
        if (!tbody) return;

        if (!listings || listings.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-secondary);">No listings created yet. Click "+ Add New Listing" to get started.</td></tr>`;
            return;
        }

        tbody.innerHTML = listings.map(apt => {
            const coverImg = apt.primaryThumbnailPath || apt.primaryImagePath || '/images/placeholder-apartment.jpg';
            return `
                <tr>
                    <td style="display:flex; align-items:center; gap:12px;">
                        <img src="${coverImg}" style="width:48px; height:48px; border-radius:6px; object-fit:cover;" onerror="this.src='/images/placeholder-apartment.jpg'">
                        <div>
                            <strong style="color:var(--text-primary); font-size:14px;">${apt.title}</strong>
                            <div style="font-size:12px; color:var(--text-secondary);">${apt.location || 'Location Pending'}</div>
                        </div>
                    </td>
                    <td><strong>${App.formatPrice(apt.price)}</strong></td>
                    <td>${apt.bedrooms || 0} Beds / ${apt.bathrooms || 0} Baths</td>
                    <td>${apt.sizeSqft || 0} sqft</td>
                    <td>${App.formatStatusBadge(apt.status)}</td>
                    <td style="text-align:right;">
                        <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('listing-details', {apartmentId: ${apt.apartmentId}})">View</button>
                        <button class="btn btn-primary btn-sm" onclick="App.navigateTo('create-listing', {apartmentId: ${apt.apartmentId}})">Edit</button>
                    </td>
                </tr>
            `;
        }).join('');
    }
};
