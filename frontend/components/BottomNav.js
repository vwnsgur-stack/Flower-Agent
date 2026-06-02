/**
 * BottomNav Component
 * @returns {string} HTML Template
 */
export function BottomNav() {
    return `
        <nav class="bottom-nav">
            <button class="nav-item active" data-tab="home">
                <i class="ph-fill ph-house"></i>
                <span>홈</span>
            </button>
            <button class="nav-item" id="addNewBtn">
                <i class="ph ph-plus-circle"></i>
                <span>예약추가</span>
            </button>
            <button class="nav-item" data-tab="calendar">
                <i class="ph ph-calendar-blank"></i>
                <span>예약보기</span>
            </button>
            <button class="nav-item" data-tab="customers">
                <i class="ph ph-users"></i>
                <span>고객정보</span>
            </button>
        </nav>
    `;
}
