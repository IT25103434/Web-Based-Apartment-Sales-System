/* REST API Wrapper */
const API = {
    getHeaders(isMultipart = false) {
        const headers = {};
        if (!isMultipart) {
            headers['Content-Type'] = 'application/json';
        }
        return headers;
    },

    async request(url, options = {}) {
        const isMultipart = options.body instanceof FormData;
        options.headers = {
            ...this.getHeaders(isMultipart),
            ...options.headers
        };

        try {
            const response = await fetch(url, options);
            if (response.status === 204) {
                return null;
            }

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const message = (data && data.message) ? data.message : `Server Error (${response.status})`;
                throw new Error(message);
            }

            return data;
        } catch (error) {
            console.error(`API Error [${options.method || 'GET'} ${url}]:`, error);
            throw error;
        }
    },

    // Agent APIs
    getAgents() {
        return this.request('/api/agents');
    },

    getCurrentAgent() {
        return this.request('/api/agents/current');
    },

    // Apartment APIs
    getDashboardStats() {
        return this.request('/api/apartments/dashboard/stats');
    },

    getListings(status = '', query = '') {
        let url = '/api/apartments?';
        if (status && status !== 'ALL') url += `status=${status}&`;
        if (query) url += `query=${encodeURIComponent(query)}&`;
        return this.request(url);
    },

    getApartment(id) {
        return this.request(`/api/apartments/${id}`);
    },

    createApartment(data) {
        return this.request('/api/apartments', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    updateApartment(id, data) {
        return this.request(`/api/apartments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    updateStatus(id, status) {
        return this.request(`/api/apartments/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    },

    deleteApartment(id) {
        return this.request(`/api/apartments/${id}`, {
            method: 'DELETE'
        });
    },

    // Image APIs
    uploadImage(apartmentId, file, isPrimary = false) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('primary', isPrimary);

        return this.request(`/api/apartments/${apartmentId}/images`, {
            method: 'POST',
            body: formData
        });
    },

    deleteImage(imageId) {
        return this.request(`/api/images/${imageId}`, {
            method: 'DELETE'
        });
    },

    setPrimaryImage(imageId) {
        return this.request(`/api/images/${imageId}/primary`, {
            method: 'PUT'
        });
    },

    reorderImages(apartmentId, imageIdsInOrder) {
        return this.request(`/api/apartments/${apartmentId}/images/order`, {
            method: 'PUT',
            body: JSON.stringify({ imageIdsInOrder })
        });
    },

    // Floor Plan APIs
    uploadFloorPlan(apartmentId, file) {
        const formData = new FormData();
        formData.append('file', file);

        return this.request(`/api/apartments/${apartmentId}/floor-plan`, {
            method: 'POST',
            body: formData
        });
    },

    deleteFloorPlan(floorPlanId) {
        return this.request(`/api/floor-plans/${floorPlanId}`, {
            method: 'DELETE'
        });
    },

    // Virtual Tour APIs
    addOrUpdateVirtualTour(apartmentId, tourUrl, tourType) {
        return this.request(`/api/apartments/${apartmentId}/virtual-tour`, {
            method: 'POST',
            body: JSON.stringify({ apartmentId, tourUrl, tourType })
        });
    },

    deleteVirtualTour(tourId) {
        return this.request(`/api/virtual-tours/${tourId}`, {
            method: 'DELETE'
        });
    },

    // Amenity APIs
    getAmenities() {
        return this.request('/api/amenities');
    }
};
