/**
 * Search Component
 * @param {string} id - The ID of the search input element
 * @param {string} placeholder - The placeholder text for the input
 * @returns {string} HTML Template
 */
export function Search(id, placeholder = "검색") {
    return `
        <div class="inline-search">
            <i class="ph ph-magnifying-glass"></i>
            <input type="text" id="${id}" placeholder="${placeholder}">
        </div>
    `;
}
