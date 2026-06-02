export function initAuth() {
    const appRoot = document.getElementById('appRoot');
    appRoot.style.paddingBottom = '0';
    appRoot.style.background = '#ffffff';
    document.body.style.backgroundColor = '#ffffff';

    appRoot.innerHTML = `
        <div class="auth-container">
            <div class="auth-box">
                <div class="auth-header">
                    <h2>Management System</h2>
                    <p>예약 및 고객관리 시스템</p>
                </div>
                

                <form id="loginForm" class="auth-form active">
                    <div class="form-group">
                        <label>이메일</label>
                        <input type="email" id="loginEmail" required placeholder="example@email.com">
                    </div>
                    <div class="form-group">
                        <label>비밀번호</label>
                        <input type="password" id="loginPassword" required placeholder="비밀번호를 입력하세요">
                    </div>
                    <button type="submit" class="auth-btn auth-btn-outline">로그인</button>
                    <button type="button" class="auth-btn auth-btn-outline" id="goRegisterBtn">회원가입</button>
                </form>

                <form id="registerForm" class="auth-form">
                    <div class="form-group">
                        <label>상호명 <span class="required">*</span></label>
                        <input type="text" id="regShopName" required placeholder="가게 이름을 입력하세요">
                    </div>
                    <div class="form-group">
                        <label>이메일 <span class="required">*</span></label>
                        <input type="email" id="regEmail" required placeholder="로그인에 사용할 이메일">
                    </div>
                    <div class="form-group">
                        <label>비밀번호 <span class="required">*</span></label>
                        <input type="password" id="regPassword" required placeholder="비밀번호 입력">
                    </div>
                    <div class="form-group">
                        <label>전화번호 <span class="required">*</span></label>
                        <input type="tel" id="regPhone" required placeholder="010-0000-0000">
                    </div>
                    <div class="form-group">
                        <label>사업자 등록 번호 <span class="required">*</span></label>
                        <input type="text" id="regBusinessNumber" required placeholder="000-00-00000">
                    </div>
                    <div class="form-group">
                        <label>가게 주소 <span class="required">*</span></label>
                        <input type="text" id="regAddress" required placeholder="상세 주소를 입력하세요">
                    </div>
                    <button type="submit" class="auth-btn auth-btn-outline">가입하기</button>
                    <button type="button" class="auth-btn auth-btn-outline" id="goLoginBtn">로그인으로 돌아가기</button>
                </form>
            </div>
        </div>
    `;

    attachAuthListeners();
}

function attachAuthListeners() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const goRegisterBtn = document.getElementById('goRegisterBtn');
    const goLoginBtn = document.getElementById('goLoginBtn');

    if (goRegisterBtn) {
        goRegisterBtn.addEventListener('click', () => {
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
        });
    }

    if (goLoginBtn) {
        goLoginBtn.addEventListener('click', () => {
            registerForm.classList.remove('active');
            loginForm.classList.add('active');
        });
    }

    const formatPhoneNumber = (value) => {
        const numbers = value.replace(/[^\d]/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    };

    const formatBusinessNumber = (value) => {
        const numbers = value.replace(/[^\d]/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`;
    };

    const regPhone = document.getElementById('regPhone');
    if (regPhone) {
        regPhone.addEventListener('input', (e) => {
            e.target.value = formatPhoneNumber(e.target.value);
        });
    }

    const regBusinessNumber = document.getElementById('regBusinessNumber');
    if (regBusinessNumber) {
        regBusinessNumber.addEventListener('input', (e) => {
            e.target.value = formatBusinessNumber(e.target.value);
        });
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const res = await fetch('http://localhost:8000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('florist_id', data.id);
                localStorage.setItem('florist_name', data.shop_name);
                localStorage.setItem('florist_email', data.email);
                localStorage.setItem('florist_business_number', data.business_number);
                window.location.reload();
            } else {
                alert('로그인 실패: 이메일 또는 비밀번호를 확인해주세요.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('서버 오류가 발생했습니다.');
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            email: document.getElementById('regEmail').value,
            password: document.getElementById('regPassword').value,
            shop_name: document.getElementById('regShopName').value,
            phone: document.getElementById('regPhone').value,
            business_number: document.getElementById('regBusinessNumber').value,
            address: document.getElementById('regAddress').value
        };

        try {
            const res = await fetch('http://localhost:8000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                alert('회원가입 완료! 로그인 해주세요.');
                if (goLoginBtn) goLoginBtn.click();
            } else {
                const err = await res.json();
                alert('가입 실패: ' + (err.detail || '입력 정보를 확인하세요.'));
            }
        } catch (error) {
            console.error('Register error:', error);
            alert('서버 오류가 발생했습니다.');
        }
    });
}
