import { initHome } from './pages/home.js';

document.addEventListener('DOMContentLoaded', () => {
    const appRoot = document.getElementById('appRoot');
    if (appRoot) {
        appRoot.innerHTML = `
        <!-- Main Content Area -->
        <div id="homeSection">
            <!-- Header Placeholder (Profile) -->
            <div id="headerContainer"></div>

            <!-- Dashboard Menu Grid -->
            <div class="dashboard-menu-grid">
                <button class="dashboard-menu-card" id="menuAddReservation">
                    <i class="ph ph-plus-circle"></i>
                    <span>예약추가</span>
                </button>
                <button class="dashboard-menu-card" id="menuViewReservations">
                    <i class="ph ph-calendar-blank"></i>
                    <span>예약보기</span>
                </button>
                <button class="dashboard-menu-card" id="menuCustomerInfo">
                    <i class="ph ph-users"></i>
                    <span>고객정보</span>
                </button>
                <button class="dashboard-menu-card" id="logoutGridBtn">
                    <i class="ph ph-sign-out" style="color: var(--danger-color);"></i>
                    <span style="color: var(--danger-color);">로그아웃</span>
                </button>
            </div>
        </div>

        <div id="scheduleSection" class="hidden">
            <!-- Navigation & Search/Filter Control Center -->
            <main class="schedule-section">
                <div class="section-header" style="position: sticky; top: 0; z-index: 10; padding-top: 24px; margin-top: -24px; padding-bottom: 16px;">
                    <!-- Calendar View Container (default) -->
                    <div id="calendarViewContainer">
                        <!-- Calendar UI will be generated here by home.js -->
                    </div>

                    <div class="filter-controls-row" style="width: 100%; margin-top: 16px;">
                        <div id="homeSearchContainer" style="width: 100%;"></div>
                    </div>
                </div>

                <div class="schedule-list" id="reservationList"></div>
            </main>
        </div>

        <div id="customerSection" class="hidden customer-section-container">
            <div class="section-header" style="padding-top: 24px; padding-bottom: 16px;">
                <div class="customer-header-row" style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                    <h2 style="white-space: nowrap;">전체 고객 관리</h2>
                    <div id="customerSearchContainer" style="width: 80%; display: flex; justify-content: flex-end;"></div>
                </div>
            </div>
            <div id="customerList" class="customer-grid" style="padding-bottom: 120px;"></div>
        </div>

        <!-- Bottom Navigation Placeholder -->
        <div id="navContainer" class="hidden"></div>

        <!-- Modals -->
        <div class="modal-overlay" id="addModal"></div>
        <div class="modal-overlay" id="detailModal"></div>
        <div class="modal-overlay" id="customerModal"></div>
        `;
    }
    
    // Check Authentication state
    const floristId = localStorage.getItem('florist_id');
    if (!floristId) {
        import('./pages/auth.js').then(module => {
            module.initAuth();
        });
    } else {
        // Initialize Home logic
        initHome();
    }
});
