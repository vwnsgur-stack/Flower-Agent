import { Header } from '../components/Header.js';
import { Search } from '../components/Search.js';
import { BottomNav } from '../components/BottomNav.js';
import { FilterChip, SegmentButton, IconButton } from '../components/Button.js';

export function initHome() {
    const appRoot = document.getElementById('appRoot');
    if (appRoot) {
        appRoot.style.paddingBottom = '';
        appRoot.style.background = '';
    }
    document.body.style.backgroundColor = '#ffffff';

    // 1. State Management
    const state = {
        userName: "사장님",
        currentDate: "4월 3일 금요일",
        currentDayOffset: 0,
        scheduleViewMode: 'calendar', // default to calendar view
        selectedDate: new Date(),
        calendarMonth: new Date(),
        searchQuery: "",
        homeFilter: "all", // all, unpaid, pending
        customerSort: "default",
        activeTab: "home",
        uploadedImage: false,
        uploadedImageUrl: null,
        aiNotes: null,
        aiFlowers: []
    };

    let mockReservations = [];

    function loadReservations() {
        fetch('http://localhost:8000/reservations/')
            .then(res => res.json())
            .then(data => {
                mockReservations = data.map(item => {
                    const rDate = item.pickup_date ? new Date(item.pickup_date) : new Date();
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    rDate.setHours(0,0,0,0);
                    const diffTime = rDate.getTime() - today.getTime();
                    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
                    
                    return {
                        id: item.id,
                        customer: item.customer.name,
                        phoneNumber: item.customer.phone_number,
                        time: item.pickup_time ? item.pickup_time.substring(0, 5) : "12:00",
                        dateStr: item.pickup_date || today.toISOString().split('T')[0],
                        status: item.status.toLowerCase(),
                        items: item.detailed_description || "상세 내용 없음",
                        offset: diffDays, 
                        isPaid: item.is_paid,
                        price: item.price,
                        hasImage: item.images && item.images.length > 0,
                        detailedDesc: item.detailed_description,
                        aiNotes: (item.images && item.images.length > 0) ? item.images[0].ai_notes : "",
                        imageUrl: (item.images && item.images.length > 0) ? item.images[0].image_url : null
                    };
                });
                renderReservations();
                renderCustomers();
            })
            .catch(err => {
                console.error("백엔드 연결 실패:", err);
                renderReservations();
                renderCustomers();
            });
    }

    function setupWebSocket() {
        const ws = new WebSocket('ws://localhost:8000/ws/notifications');
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'new_reservation') {
                showToast(data.message);
                loadReservations();
            }
        };
        ws.onclose = () => { setTimeout(setupWebSocket, 3000); };
    }

    function showToast(message) {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // 2. Hydration Functions
    function hydrateStaticComponents() {
        document.getElementById('headerContainer').innerHTML = Header(state.userName, state.currentDate);
        document.getElementById('navContainer').innerHTML = BottomNav();
        
        document.getElementById('homeSearchContainer').innerHTML = Search('globalSearchInput', '고객명 또는 번호 검색');
        document.getElementById('customerSearchContainer').innerHTML = Search('customerSearchInput', '고객명 또는 번호 검색');
        
        // Modal placeholder logic could go here or remain in index.html
        renderModals();
    }

    function renderModals() {
        const addModal = document.getElementById('addModal');
        addModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>새 예약 등록</h2>
                    <button class="close-btn" id="closeModalBtn"><i class="ph ph-x"></i></button>
                </div>
                <div class="modal-body">
                    <form id="reservationForm">
                        <div class="input-group">
                            <label>고객명</label>
                            <input type="text" id="customerName" placeholder="고객명을 입력하세요" required>
                        </div>
                        <div class="input-group">
                            <label>전화번호</label>
                            <input type="text" id="phoneNumber">
                        </div>
                        <div class="input-group">
                            <label>결제 상태</label>
                            <div class="segmented-control" id="addPaymentSegmentGroup">
                                ${SegmentButton('선결제', 'true')}
                                ${SegmentButton('미결제', 'false')}
                            </div>
                            <input type="hidden" id="addIsPaid" value="">
                        </div>
                        <div class="input-group">
                            <label>결제 금액</label>
                            <input type="text" id="reservationPrice" placeholder="예: 50,000">
                        </div>
                        <div class="input-group">
                            <label>픽업 날짜</label>
                            <input type="text" id="pickupDate" placeholder="YYYY-MM-DD / - 없이 입력" required>
                        </div>
                        <div class="input-group">
                            <label>픽업 시간</label>
                            <div style="display: flex; gap: 16px; align-items: center;">
                                <div class="segmented-control" id="addAmPmSegmentGroup" style="flex: 1;">
                                    ${SegmentButton('오전', 'AM')}
                                    ${SegmentButton('오후', 'PM')}
                                </div>
                                <input type="hidden" id="addAmPm" value="">
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <input type="number" id="pickupHour" placeholder="시" min="1" max="12" required style="width: 70px; text-align: center; padding: 14px 8px;">
                                    <span style="font-weight: 700; color: #1e293b;">:</span>
                                    <input type="number" id="pickupMinute" placeholder="분" min="0" max="59" required style="width: 70px; text-align: center; padding: 14px 8px;">
                                </div>
                            </div>
                        </div>
                        <div class="input-group">
                            <label>상세 내용</label>
                            <textarea id="detailedDescription" class="textarea-full" style="height: 160px; resize: none;"></textarea>
                        </div>
                        <div class="input-group">
                            <label>레퍼런스 이미지 첨부</label>
                            <div class="upload-area" id="uploadArea">
                                <i class="ph ph-upload-simple"></i>
                                <span>사진 업로드 및 AI 꽃 분석</span>
                                <input type="file" id="imageInput" accept="image/*" hidden>
                            </div>
                        </div>
                        <div class="preview-container" id="previewContainer" style="display: none; cursor: pointer;" title="클릭하여 이미지 재등록">
                            <img id="imagePreview" src="" alt="시안">
                            <div class="ai-overlay" id="aiLoading">
                                <div class="spinner"></div>
                                <span>AI가 꽃과 사입 자재를 분석 중입니다...</span>
                            </div>
                        </div>
                        <div class="ai-result-box" id="aiResultBox" style="display: none;">
                            <div class="result-header">
                                <i class="ph-fill ph-magic-wand"></i>
                                <span>AI 분석 완료</span>
                            </div>
                            <textarea id="materialsText" rows="4" placeholder="사입 목록을 입력하세요..."></textarea>
                        </div>
                        <button type="submit" class="submit-btn" id="submitBtn">예약 등록하기</button>
                    </form>
                </div>
            </div>
        `;

        const customerModal = document.getElementById('customerModal');
        if (customerModal) {
            customerModal.innerHTML = `
                <div class="modal-content" style="max-width: 600px; width: 90%;">
                    <div class="modal-header">
                        <div></div>
                        <button class="close-btn" id="closeCustomerModalBtn"><i class="ph ph-x"></i></button>
                    </div>
                    <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                        <div id="customerDetailList" style="display: flex; flex-direction: column; gap: 12px;">
                            <!-- Items will be injected here -->
                        </div>
                    </div>
                </div>
            `;
        }

        const detailModal = document.getElementById('detailModal');
        if (detailModal) {
            detailModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>예약 상세 정보</h2>
                        <div style="display: flex; gap: 8px;">
                            <button class="delete-btn" id="deleteReservationBtn" style="background: #fee2e2; color: #ef4444; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 4px;"><i class="ph ph-trash"></i> 삭제</button>
                            <button class="close-btn" id="closeDetailModalBtn"><i class="ph ph-x"></i></button>
                        </div>
                    </div>
                    <div class="modal-body">
                        <div style="display: flex; flex-direction: column; gap: 16px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <h3 id="detailCustomerName" style="margin: 0; font-size: 18px; color: #1e293b;"></h3>
                                    <div id="detailPhoneNumber" style="color: #64748b; font-size: 14px; margin-top: 4px;"></div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 14px; font-weight: 500; color: #475569;">픽업 상태</span>
                                    <div class="custom-dropdown" id="pickupDropdown">
                                        <div class="dropdown-selected" id="pickupSelectedValue">대기중</div>
                                        <div class="dropdown-options" id="pickupOptionsList">
                                            <div class="dropdown-option" data-value="pending">대기중</div>
                                            <div class="dropdown-option" data-value="picked_up">픽업완료</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="info-group">
                                <label style="font-size: 13px; color: #94a3b8; margin-bottom: 4px; display: block;">픽업 시간</label>
                                <div id="detailTime" style="font-weight: 600; color: #334155; font-size: 15px;"></div>
                            </div>

                            <div class="info-group">
                                <label style="font-size: 13px; color: #94a3b8; margin-bottom: 4px; display: block;">상세 내용</label>
                                <div id="detailItems" style="background: #f8fafc; padding: 12px; border-radius: 8px; color: #334155; font-size: 14px; white-space: pre-wrap; line-height: 1.5;"></div>
                            </div>

                            <div class="info-group" id="detailReferenceGroup" style="display: none;">
                                <label style="font-size: 13px; color: #94a3b8; margin-bottom: 4px; display: block;">레퍼런스 내용</label>
                                <img id="detailReferenceImage" style="width: 100%; max-height: 300px; object-fit: contain; border-radius: 8px; margin-bottom: 12px; display: none;" />
                                <div id="detailReferenceNotes" style="background: #f8fafc; padding: 12px; border-radius: 8px; color: #334155; font-size: 14px; white-space: pre-wrap; line-height: 1.5;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // 3. Dynamic Rendering Functions
    function renderReservations() {
        const reservationList = document.getElementById('reservationList');
        reservationList.innerHTML = '';
        const searchLower = state.searchQuery.toLowerCase();

        const filteredData = mockReservations.filter(res => {
            let matchesDay = false;
            if (state.scheduleViewMode === 'calendar') {
                const selDateStr = `${state.selectedDate.getFullYear()}-${String(state.selectedDate.getMonth() + 1).padStart(2, '0')}-${String(state.selectedDate.getDate()).padStart(2, '0')}`;
                matchesDay = res.dateStr === selDateStr;
            } else {
                matchesDay = res.offset === state.currentDayOffset;
            }
            const matchesSearch = res.customer.toLowerCase().includes(searchLower) || 
                                (res.phoneNumber && res.phoneNumber.includes(searchLower));

            return matchesDay && matchesSearch;
        });
        
        if (filteredData.length === 0) {
            reservationList.innerHTML = '<div class="no-results" style="text-align:center; padding:40px; color:#94a3b8;">표시할 일정이 없습니다.</div>';
            return;
        }

        filteredData.sort((a, b) => a.time.localeCompare(b.time));

        filteredData.forEach(res => {
            const [hour, minute] = res.time.split(':');
            const ampm = parseInt(hour) >= 12 ? '오후' : '오전';
            let displayHour = parseInt(hour) % 12 || 12;
            
            const paymentText = res.isPaid ? '선결제' : '미결제';
            const paymentClass = res.isPaid ? 'prepaid' : 'unpaid';
            const isPickedUp = res.status === 'picked_up';
            
            let phoneSuffix = res.phoneNumber && res.phoneNumber.length >= 4 
                ? res.phoneNumber.slice(-4) 
                : (res.phoneNumber || '번호없음');

            const card = document.createElement('div');
            card.className = `schedule-card ${isPickedUp ? 'is-picked-up' : ''}`;
            card.onclick = () => openDetailModal(res.id);
            
            card.innerHTML = `
                ${isPickedUp ? '<div class="picked-up-overlay">픽업 완료</div>' : ''}
                <div class="card-time-col">
                    <span class="time-ampm">${ampm}</span>
                    <span class="time-hhmm">${displayHour}:${minute}</span>
                </div>
                <div class="card-info">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <div class="card-title" style="margin-bottom: 0;">${res.customer} 고객님</div>
                        <div class="card-phone" style="margin-bottom: 0;">${phoneSuffix}</div>
                        <div class="status-badge-small ${paymentClass}">${paymentText}</div>
                    </div>
                    <div class="card-preview-text">
                        <span>${res.items.length > 20 ? res.items.substring(0, 20) + '...' : res.items}</span>
                    </div>
                </div>
            `;
            reservationList.appendChild(card);
        });
    }

    function renderCustomers() {
        const customerList = document.getElementById('customerList');
        customerList.innerHTML = '';
        const searchLower = state.searchQuery.toLowerCase();
        
        const customersMap = {};
        mockReservations.forEach(res => {
            const key = res.phoneNumber || '번호없음';
            if (!customersMap[key]) {
                customersMap[key] = { name: res.customer, phone: res.phoneNumber, count: 0 };
            }
            customersMap[key].count++;
        });

        let customersListSorted = Object.values(customersMap).filter(cust => {
            return cust.name.toLowerCase().includes(searchLower) || 
                   (cust.phone && cust.phone.includes(searchLower));
        });

        if (state.customerSort === 'visits') {
            customersListSorted.sort((a, b) => b.count - a.count);
        } else if (state.customerSort === 'name') {
            customersListSorted.sort((a, b) => a.name.localeCompare(b.name));
        }

        if (customersListSorted.length === 0) {
            customerList.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
            return;
        }

        customersListSorted.forEach(cust => {
            const card = document.createElement('div');
            card.className = 'customer-box-card';
            card.style.cursor = 'pointer';
            card.onclick = () => openCustomerDetailModal(cust);
            card.innerHTML = `
                <div class="customer-box-name">${cust.name}</div>
                <div class="customer-box-phone">${cust.phone || '번호없음'}</div>
                <div class="customer-box-visits">${cust.count}회 방문</div>
            `;
            customerList.appendChild(card);
        });
    }

    // 4. Global Actions
    window.openCustomerDetailModal = function(customerData) {
        const modal = document.getElementById('customerModal');
        const listContainer = document.getElementById('customerDetailList');
        
        // Filter reservations for this customer
        const customerReservations = mockReservations.filter(res => 
            res.customer === customerData.name && 
            (res.phoneNumber || '번호없음') === (customerData.phone || '번호없음')
        );
        
        // Sort by date descending
        customerReservations.sort((a, b) => new Date(b.dateStr) - new Date(a.dateStr));
        
        // Render
        let html = `
            <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; text-align: center;">
                <h3 style="margin: 0; color: #1e293b; font-size: 20px; font-weight: 700;">${customerData.name} 고객님</h3>
                <div style="color: #64748b; font-size: 15px; margin-top: 6px;">${customerData.phone || '번호 없음'}</div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
        `;
        
        if (customerReservations.length === 0) {
            html += '<div style="text-align: center; color: #64748b; padding: 20px;">방문 내역이 없습니다.</div>';
        } else {
            // Header row
            html += `
                <div style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 0 16px 8px 16px;">
                    <div style="font-size: 13px; font-weight: 500; color: #94a3b8; flex: 1;">방문날짜</div>
                    <div style="font-size: 13px; font-weight: 500; color: #94a3b8; flex: 1; text-align: right;">결제금액</div>
                </div>
            `;
            customerReservations.forEach(res => {
                const priceText = res.price ? parseInt(res.price).toLocaleString() + '원' : '-';
                
                html += `
                    <div style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 16px; background: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9;">
                        <div style="color: #334155; font-weight: 500; flex: 1;">${res.dateStr}</div>
                        <div style="font-weight: 700; color: #3b82f6; flex: 1; text-align: right;">${priceText}</div>
                    </div>
                `;
            });
        }
        html += `</div>`;
        
        listContainer.innerHTML = html;
        modal.classList.add('active');
    };

    window.openDetailModal = function(id) {
        const item = mockReservations.find(res => res.id === id);
        if (item) {
            document.getElementById('deleteReservationBtn').dataset.id = id;
            document.getElementById('detailCustomerName').textContent = item.customer;
            document.getElementById('detailPhoneNumber').textContent = item.phoneNumber || "번호없음";
            const [hour, minute] = item.time.split(':');
            const ampm = parseInt(hour) >= 12 ? '오후' : '오전';
            let displayHour = parseInt(hour) % 12 || 12;
            
            document.getElementById('detailTime').textContent = `${ampm} ${displayHour}:${minute}`;
            
            document.getElementById('detailItems').innerText = item.detailedDesc || "상세 내용 없음";
            
            const refGroup = document.getElementById('detailReferenceGroup');
            const refNotes = document.getElementById('detailReferenceNotes');
            const refImage = document.getElementById('detailReferenceImage');
            
            refGroup.style.display = 'block';
            if (item.hasImage && item.aiNotes) {
                refNotes.innerText = item.aiNotes;
            } else {
                refNotes.innerText = '레퍼런스 분석 내용 없음';
            }
            
            if (item.imageUrl) {
                refImage.src = item.imageUrl;
                refImage.style.display = 'block';
            } else {
                refImage.style.display = 'none';
            }
            
            const pickupDropdown = document.getElementById('pickupDropdown');
            if (pickupDropdown) {
                const newDropdown = pickupDropdown.cloneNode(true);
                pickupDropdown.parentNode.replaceChild(newDropdown, pickupDropdown);
                
                const newSelectedValue = newDropdown.querySelector('.dropdown-selected');
                const newOptions = newDropdown.querySelectorAll('.dropdown-option');
                
                // Set initial state
                const currentStatus = item.status === 'picked_up' ? 'picked_up' : 'pending';
                newSelectedValue.textContent = currentStatus === 'picked_up' ? '픽업완료' : '대기중';
                newOptions.forEach(opt => {
                    if (opt.getAttribute('data-value') === currentStatus) opt.classList.add('selected');
                    else opt.classList.remove('selected');
                });
                
                // Toggle dropdown list
                newSelectedValue.addEventListener('click', (e) => {
                    e.stopPropagation();
                    newDropdown.classList.toggle('active');
                });
                
                // Option click handling
                newOptions.forEach(opt => {
                    opt.addEventListener('click', (e) => {
                        const value = opt.getAttribute('data-value');
                        item.status = value;
                        newSelectedValue.textContent = opt.textContent;
                        newOptions.forEach(o => o.classList.remove('selected'));
                        opt.classList.add('selected');
                        newDropdown.classList.remove('active');
                        renderReservations();
                    });
                });
            }
            
            document.getElementById('detailModal').classList.add('active');
        }
    };

    function renderCalendar() {
        const calendarContainer = document.getElementById('calendarViewContainer');
        if (!calendarContainer) return;
        
        const year = state.calendarMonth.getFullYear();
        const month = state.calendarMonth.getMonth();
        
        let html = `
        <div class="calendar-wrapper">
            <div class="calendar-header">
                <button id="prevMonthBtn"><i class="ph ph-caret-left"></i></button>
                <span>${year}년 ${month + 1}월</span>
                <button id="nextMonthBtn"><i class="ph ph-caret-right"></i></button>
            </div>
            <div class="calendar-weekdays">
                <div>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div>
            </div>
            <div class="calendar-grid" id="calendarGrid">
        `;
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const selected = new Date(state.selectedDate);
        selected.setHours(0,0,0,0);
        
        for (let i = 0; i < firstDay; i++) {
            html += `<div class="calendar-day empty"></div>`;
        }
        
        for (let d = 1; d <= daysInMonth; d++) {
            const current = new Date(year, month, d);
            current.setHours(0,0,0,0);
            
            const isToday = current.getTime() === today.getTime();
            const isSelected = current.getTime() === selected.getTime();
            
            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (isSelected) classes += ' selected';
            
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const hasEvent = mockReservations.some(r => r.dateStr === dateStr);
            
            html += `<div class="${classes}" data-date="${dateStr}">
                ${d}
                ${hasEvent ? '<div class="calendar-dot"></div>' : ''}
            </div>`;
        }
        
        html += `</div></div>`;
        calendarContainer.innerHTML = html;
        
        document.getElementById('prevMonthBtn').addEventListener('click', () => {
            state.calendarMonth.setMonth(state.calendarMonth.getMonth() - 1);
            renderCalendar();
        });
        document.getElementById('nextMonthBtn').addEventListener('click', () => {
            state.calendarMonth.setMonth(state.calendarMonth.getMonth() + 1);
            renderCalendar();
        });
        
        document.querySelectorAll('.calendar-day:not(.empty)').forEach(dayEl => {
            dayEl.addEventListener('click', () => {
                state.selectedDate = new Date(dayEl.getAttribute('data-date'));
                renderCalendar(); 
                renderReservations();
            });
        });
    }

    function updateScheduleHeader() {
        const scheduleTitle = document.getElementById('scheduleTitle');
        if (state.currentDayOffset === 0) scheduleTitle.textContent = "오늘의 스케줄";
        else if (state.currentDayOffset === -1) scheduleTitle.textContent = "어제의 스케줄";
        else if (state.currentDayOffset === 1) scheduleTitle.textContent = "내일의 스케줄";
        else if (state.currentDayOffset > 1) scheduleTitle.textContent = `${state.currentDayOffset}일 뒤 스케줄`;
        else scheduleTitle.textContent = `${Math.abs(state.currentDayOffset)}일 전 스케줄`;
        renderReservations();
    }

    // 5. Event Listeners Initialization
    function attachListeners() {
        // Logout Action
        document.getElementById('logoutGridBtn')?.addEventListener('click', () => {
            if (confirm("로그아웃 하시겠습니까?")) {
                localStorage.removeItem('florist_id');
                localStorage.removeItem('florist_name');
                window.location.reload();
            }
        });

        // Tab switching
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.getAttribute('data-tab');
                if (tab === 'home' || tab === 'customers' || tab === 'calendar') {
                    state.activeTab = tab;
                    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                    item.classList.add('active');
                    
                    document.getElementById('homeSection').classList.add('hidden');
                    document.getElementById('customerSection').classList.add('hidden');
                    document.getElementById('scheduleSection').classList.add('hidden');

                    if (tab === 'home') {
                        document.getElementById('navContainer').classList.add('hidden');
                        document.getElementById('homeSection').classList.remove('hidden');
                    } else {
                        document.getElementById('navContainer').classList.remove('hidden');
                        if (tab === 'calendar') {
                            document.getElementById('scheduleSection').classList.remove('hidden');
                            renderCalendar();
                            renderReservations();
                        } else if (tab === 'customers') {
                            document.getElementById('customerSection').classList.remove('hidden');
                            renderCustomers();
                        }
                    }
                }
            });
        });

        // Search synchronization
        const syncSearch = (query) => {
            state.searchQuery = query;
            document.getElementById('globalSearchInput').value = query;
            document.getElementById('customerSearchInput').value = query;
            renderReservations();
            renderCustomers();
        };
        document.getElementById('globalSearchInput').addEventListener('input', (e) => syncSearch(e.target.value));
        document.getElementById('customerSearchInput').addEventListener('input', (e) => syncSearch(e.target.value));

        // Filter chips
        document.querySelectorAll('#homeFilterBar .filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('#homeFilterBar .filter-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                state.homeFilter = chip.getAttribute('data-filter');
                renderReservations();
            });
        });

        // Phone Number Auto Formatting
        document.getElementById('phoneNumber').addEventListener('input', (e) => {
            let val = e.target.value.replace(/[^0-9]/g, '');
            if (val.length > 3 && val.length <= 7) {
                val = val.substring(0, 3) + '-' + val.substring(3);
            } else if (val.length > 7) {
                val = val.substring(0, 3) + '-' + val.substring(3, 7) + '-' + val.substring(7, 11);
            }
            e.target.value = val;
        });

        // Date Auto Formatting (YYYY-MM-DD)
        document.getElementById('pickupDate').addEventListener('input', (e) => {
            let val = e.target.value.replace(/[^0-9]/g, '');
            if (val.length > 4 && val.length <= 6) {
                val = val.substring(0, 4) + '-' + val.substring(4);
            } else if (val.length > 6) {
                val = val.substring(0, 4) + '-' + val.substring(4, 6) + '-' + val.substring(6, 8);
            }
            e.target.value = val;
        });

        // Modal: Add New
        const addModal = document.getElementById('addModal');
        document.getElementById('addNewBtn').addEventListener('click', () => {
            addModal.classList.add('active');
            document.getElementById('reservationForm').reset();
            document.getElementById('previewContainer').style.display = 'none';
            document.getElementById('aiResultBox').style.display = 'none';
            document.getElementById('uploadArea').style.display = 'block';
            document.getElementById('imagePreview').src = '';
            document.getElementById('materialsText').value = '';
            state.uploadedImage = false;
            state.uploadedImageUrl = null;
            state.aiNotes = null;
            state.aiFlowers = [];
            
            // Set defaults when opening the modal
            const defaultPaymentBtn = document.querySelector('#addPaymentSegmentGroup .segment-btn[data-value="true"]');
            if (defaultPaymentBtn) defaultPaymentBtn.click();
            
            const defaultAmPmBtn = document.querySelector('#addAmPmSegmentGroup .segment-btn[data-value="AM"]');
            if (defaultAmPmBtn) defaultAmPmBtn.click();
        });
        document.getElementById('closeModalBtn').addEventListener('click', () => addModal.classList.remove('active'));

        document.getElementById('closeCustomerModalBtn')?.addEventListener('click', () => {
            document.getElementById('customerModal').classList.remove('active');
        });

        document.getElementById('closeDetailModalBtn')?.addEventListener('click', () => {
            document.getElementById('detailModal').classList.remove('active');
        });

        document.getElementById('deleteReservationBtn')?.addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.id;
            if (!id) return;
            if (confirm("정말로 이 예약을 삭제하시겠습니까? 데이터가 완전히 삭제됩니다.")) {
                try {
                    const response = await fetch(`http://localhost:8000/reservations/${id}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        document.getElementById('detailModal').classList.remove('active');
                        loadReservations();
                    } else {
                        alert("예약 삭제에 실패했습니다.");
                    }
                } catch (err) {
                    alert("서버 오류로 삭제하지 못했습니다.");
                }
            }
        });

        // Global click listener to close custom dropdowns
        document.addEventListener('click', (e) => {
            const activeDropdowns = document.querySelectorAll('.custom-dropdown.active');
            activeDropdowns.forEach(dropdown => {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('active');
                }
            });
        });

        // Dashboard Menu Actions
        document.getElementById('menuAddReservation')?.addEventListener('click', () => {
            document.getElementById('addNewBtn').click();
        });
        document.getElementById('menuViewReservations')?.addEventListener('click', () => {
            const calendarTab = document.querySelector('.nav-item[data-tab="calendar"]');
            if (calendarTab) calendarTab.click();
        });
        document.getElementById('menuCustomerInfo')?.addEventListener('click', () => {
            const customerTab = document.querySelector('.nav-item[data-tab="customers"]');
            if (customerTab) customerTab.click();
        });

        // Form: AI Upload & Payment Segment
        const reservationForm = document.getElementById('reservationForm');
        document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('imageInput').click());
        document.getElementById('previewContainer').addEventListener('click', () => document.getElementById('imageInput').click());
        document.getElementById('imageInput').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    document.getElementById('uploadArea').style.display = 'none';
                    document.getElementById('previewContainer').style.display = 'block';
                    document.getElementById('imagePreview').src = evt.target.result;
                    document.getElementById('aiLoading').style.display = 'flex';
                    document.getElementById('aiResultBox').style.display = 'none';
                };
                reader.readAsDataURL(file);

                const formData = new FormData();
                formData.append('file', file);

                try {
                    const response = await fetch('http://localhost:8000/analyze-image/', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (!response.ok) throw new Error("Upload failed");
                    
                    const data = await response.json();
                    
                    state.uploadedImage = true;
                    state.uploadedImageUrl = data.image_url;
                    state.aiNotes = data.ai_summary;
                    state.aiFlowers = data.ai_flowers;

                    document.getElementById('aiLoading').style.display = 'none';
                    document.getElementById('aiResultBox').style.display = 'block';
                    document.getElementById('materialsText').value = data.ai_summary;
                    
                    if (!data.ai_flowers) {
                        alert(data.ai_summary);
                    }
                } catch (err) {
                    console.error(err);
                    alert("시스템 에러: " + err.message);
                    document.getElementById('aiLoading').style.display = 'none';
                    document.getElementById('uploadArea').style.display = 'flex';
                    document.getElementById('previewContainer').style.display = 'none';
                } finally {
                    e.target.value = ''; // Reset input to allow selecting the same file again
                }
            }
        });

        document.querySelectorAll('#addPaymentSegmentGroup .segment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#addPaymentSegmentGroup .segment-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('addIsPaid').value = btn.getAttribute('data-value');
            });
        });

        document.querySelectorAll('#addAmPmSegmentGroup .segment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#addAmPmSegmentGroup .segment-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('addAmPm').value = btn.getAttribute('data-value');
            });
        });

        // Set Defaults
        const defaultPaymentBtn = document.querySelector('#addPaymentSegmentGroup .segment-btn[data-value="true"]');
        if (defaultPaymentBtn) defaultPaymentBtn.click();
        
        const defaultAmPmBtn = document.querySelector('#addAmPmSegmentGroup .segment-btn[data-value="AM"]');
        if (defaultAmPmBtn) defaultAmPmBtn.click();

        const priceInputEl = document.getElementById('reservationPrice');
        priceInputEl.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9]/g, '');
            if (value) {
                e.target.value = parseInt(value, 10).toLocaleString();
            } else {
                e.target.value = '';
            }
        });

        reservationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const isPaidValue = document.getElementById('addIsPaid').value;
            if (isPaidValue === "") { alert("결제 상태를 선택해주세요."); return; }
            
            const ampm = document.getElementById('addAmPm').value;
            if (!ampm) { alert("픽업 시간(오전/오후)을 선택해주세요."); return; }

            const priceInput = document.getElementById('reservationPrice').value.replace(/,/g, '');
            const price = priceInput ? parseInt(priceInput, 10) : null;
            
            let hour = parseInt(document.getElementById('pickupHour').value, 10);
            const minute = document.getElementById('pickupMinute').value.padStart(2, '0');
            
            if (isNaN(hour) || hour < 1 || hour > 12) { alert("올바른 시(1~12)를 입력해주세요."); return; }
            if (isNaN(parseInt(minute, 10)) || parseInt(minute, 10) < 0 || parseInt(minute, 10) > 59) { alert("올바른 분(0~59)을 입력해주세요."); return; }

            if (ampm === 'PM' && hour !== 12) hour += 12;
            if (ampm === 'AM' && hour === 12) hour = 0;
            
            const formattedTime = `${hour.toString().padStart(2, '0')}:${minute}:00`;

            const payload = {
                customer_name: document.getElementById('customerName').value,
                phone_number: document.getElementById('phoneNumber').value,
                pickup_date: document.getElementById('pickupDate').value || new Date().toISOString().split('T')[0],
                pickup_time: formattedTime,
                is_paid: isPaidValue === 'true',
                price: price,
                detailed_description: document.getElementById('detailedDescription').value,
                image_url: state.uploadedImage ? state.uploadedImageUrl : null,
                ai_notes: state.uploadedImage ? document.getElementById('materialsText').value : null,
                ai_detected_flowers: state.uploadedImage ? state.aiFlowers : []
            };

            fetch('http://localhost:8000/reservations/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(() => {
                state.uploadedImage = false;
                state.uploadedImageUrl = null;
                state.aiNotes = null;
                state.aiFlowers = [];
                addModal.classList.remove('active');
                // loadReservations(); // Will be triggered automatically via WebSocket feedback
            }).catch(e => {
                alert("등록 실패: 백엔드 연결을 확인해주세요.");
            });
        });
    }

    // 6. Init
    hydrateStaticComponents();
    attachListeners();
    loadReservations();
    setupWebSocket();
}
