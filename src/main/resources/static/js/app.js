/* Main Application Router & UI State Controller */
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

const App = {
    currentView: 'dashboard',
    currentAgent: null,

    async init() {
        this.setupNavigation();
        await this.loadCurrentAgent();
        this.setupModals();
        
        // Initial view load
        this.navigateTo('dashboard');
    },

    async loadCurrentAgent() {
        try {
            const agent = await API.getCurrentAgent();
            this.currentAgent = agent;
            const badgeEl = document.getElementById('current-agent-display-name');
            if (badgeEl && agent) {
                badgeEl.textContent = `${agent.name}${agent.agency ? ' (' + agent.agency + ')' : ''}`;
            }
        } catch (error) {
            console.error('Failed to load Temporary Development Current Agent:', error);
            this.showToast('Error loading current agent from database: ' + error.message, 'error');
        }
    },

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-item button');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetView = btn.dataset.view;
                if (targetView) {
                    navButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.navigateTo(targetView);
                }
            });
        });
    },

    navigateTo(viewName, params = {}) {
        this.currentView = viewName;

        // Hide all views
        document.querySelectorAll('.view-section').forEach(sec => {
            sec.classList.remove('active-view');
        });

        // Update nav item active state
        document.querySelectorAll('.nav-item button').forEach(btn => {
            if (btn.dataset.view === viewName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Activate view element
        const targetElement = document.getElementById(`view-${viewName}`);
        if (targetElement) {
            targetElement.classList.add('active-view');
        }

        // View lifecycle handlers
        switch (viewName) {
            case 'dashboard':
                DashboardView.load();
                break;
            case 'my-listings':
                MyListingsView.load(params.filter || 'ALL');
                break;
            case 'create-listing':
                CreateEditListingView.load(params.apartmentId || null);
                break;
            case 'listing-details':
                ListingDetailsView.load(params.apartmentId);
                break;
        }
    },

    refreshCurrentView() {
        this.navigateTo(this.currentView);
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = '✓';
        if (type === 'error') icon = '✕';
        if (type === 'info') icon = 'ℹ';

        toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    setupModals() {
        document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target === el) {
                    this.closeModals();
                }
            });
        });
    },

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    },

    closeModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    },

    formatPrice(val) {
        if (!val) return 'Rs 0';
        return new Intl.NumberFormat('en-SL', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val);
    },

    formatStatusBadge(status) {
        const s = (status || 'DRAFT').toLowerCase();
        return `<span class="badge badge-${s}">${status}</span>`;
    }
};
