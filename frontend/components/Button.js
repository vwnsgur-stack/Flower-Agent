/**
 * FilterChip Component
 * @param {string} label - The label for the chip
 * @param {string} filterValue - The data-filter value
 * @param {boolean} active - Whether the chip is active
 * @returns {string} HTML Template
 */
export function FilterChip(label, filterValue, active = false) {
    return `
        <button class="filter-chip ${active ? 'active' : ''}" data-filter="${filterValue}">${label}</button>
    `;
}

/**
 * SegmentButton Component
 * @param {string} label - The label for the button
 * @param {string} value - The data-value
 * @returns {string} HTML Template
 */
export function SegmentButton(label, value) {
    return `
        <button type="button" class="segment-btn" data-value="${value}">${label}</button>
    `;
}

/**
 * IconButton Component (e.g., date navigation)
 * @param {string} id - The element ID
 * @param {string} iconClass - The Phosphor icon class (e.g., 'ph ph-caret-left')
 * @returns {string} HTML Template
 */
export function IconButton(id, iconClass) {
    return `
        <button class="icon-btn" id="${id}"><i class="${iconClass}"></i></button>
    `;
}
