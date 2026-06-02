/**
 * Header Component
 * @param {string} userName 
 * @param {string} dateString 
 * @returns {string} HTML Template
 */
export function Header(userName, dateString) {
    const shopName = localStorage.getItem('florist_name') || "플라워 스튜디오";
    const shopEmail = localStorage.getItem('florist_email') || "example@gmail.com";
    const shopBusinessNumber = localStorage.getItem('florist_business_number') || "000-00-00000";
    const formatBizNum = (num) => {
        const n = num.replace(/[^0-9]/g, '');
        if (n.length === 10) return `${n.substring(0,3)}-${n.substring(3,5)}-${n.substring(5)}`;
        return num;
    };
    return `
        <header class="app-header-profile" style="position: relative;">
            <div class="profile-center">
                <div class="profile-image-wrapper">
                    <img src="./assets/profile.jpg" alt="Shop Profile" class="profile-img">
                </div>
                <h1 class="shop-name">${shopName}</h1>
                <p class="shop-email">${shopEmail}</p>
                <p class="shop-email" style="margin-top: 4px;">사업자 번호: ${formatBizNum(shopBusinessNumber)}</p>
            </div>
        </header>
    `;
}
