# 🌷 Flower AI Manager

AI 기반 플로리스트 예약 및 고객 관리 시스템입니다. 
복잡한 꽃 예약 내역을 캘린더로 한눈에 관리하고, 고객이 보낸 시안 이미지를 AI가 분석하여 필요한 꽃과 사입 자재를 자동으로 추출해 줍니다.

## 🖼 스크린샷 (Screenshots)

### 로그인
![로그인](FlowerManagerPicture/01_로그인.png)
**상세내용** - 회원의 정보를 입력하는 로그인페이지입니다. 회원가입버튼을 통해 회원가입 페이지로 이동합니다.

### 회원가입
![회원가입](FlowerManagerPicture/02_회원가입.png)
**상세내용** - 회원의 모든 정보를 입력 후 가입하는 페이지입니다.

### 메인페이지
![메인페이지](FlowerManagerPicture/03_메인페이지.png)
**상세내용** - 로그인 후 나타나는 메인페이지입니다. 각 카테고리별로 상세내용을 확인 할 수 있습니다.

### 예약추가
![예약추가](FlowerManagerPicture/04_새예약등록.png)
**상세내용** - 고객의 예약 내용을 추가하는 페이지입니다. 레퍼런스 사진을 등록하면 AI가 이미지의 내용을 분석 후 결과를 도출합니다.

![예약추가 상세](FlowerManagerPicture/05_새예약등록.png)
**상세내용2** - 이미지 레퍼런스의 결과 내용을 확인할 수 있습니다.

### 예약보기
![예약보기](FlowerManagerPicture/06_예약보기.png)
**상세내용** - 추가된 예약을 날짜별로 확인할 수 있습니다. 예약의 정보를 클릭하면 예약의 상세 내용을 확인할 수 있습니다.

![예약상세보기](FlowerManagerPicture/07_예약상세보기.png)
**상세내용2** - 상세내용을 확인할 수 있습니다. 잘못된 예약일 경우 삭제버튼을 눌러 예약을 삭제할 수 있습니다. 픽업상태에 따라 대기중/픽업완료 를 선택할 수 있습니다.

### 전체 고객 관리
![전체 고객 관리](FlowerManagerPicture/08_전체고객관리.png)
**상세내용** - 총 방문한 고객의 정보를 확인할 수 있습니다. 해당 고객의 정보를 클릭할 시 방문날짜 및 결제구매내역을 확인할 수 있습니다.

![전체 고객 상세 관리](FlowerManagerPicture/09_전체고객관리.png)
**상세내용2** - 방문한 고객의 상세 내용입니다.

## ✨ 주요 기능 (Key Features)
- **📅 캘린더 기반 스케줄링**: 직관적인 달력 UI로 일자별 예약 내역과 픽업 시간을 관리합니다.
- **🤖 AI 시안 이미지 분석**: 예약 시 첨부된 레퍼런스 이미지를 AI가 분석하여 꽃 종류와 사입해야 할 자재 목록을 자동으로 작성합니다.
- **👥 고객 관리 (CRM)**: 고객별 방문 횟수, 결제 금액, 지난 예약 내역을 모아볼 수 있습니다.
- **🔔 실시간 알림**: 새로운 예약이 접수되면 WebSocket을 통해 화면에 실시간 알림 토스트를 띄워줍니다.
- **💳 예약 상태 관리**: 선결제/미결제 상태 및 픽업(대기/완료) 여부를 간편하게 관리합니다.

## 🛠 기술 스택 (Tech Stack)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla JS)
- **Backend**: Python, FastAPI
- **Database**: SQLite (SQLAlchemy ORM)
- **AI**: OpenAI Vision API 
- **Communication**: REST API, WebSockets

## 🚀 시작하기 (Getting Started)

### 1. 백엔드 (Backend) 실행
```bash
# 1. backend 폴더로 이동
cd backend

# 2. 필요한 패키지 설치
pip install -r requirements.txt

# 3. 환경변수(.env) 설정 (OpenAI API 키 등)
# backend 폴더 안에 .env 파일을 생성하고 아래 내용을 입력하세요.
# OPENAI_API_KEY=your_api_key_here

# 4. FastAPI 서버 실행 (http://localhost:8000)
uvicorn main:app --reload
```
API 명세서(Swagger UI)는 `http://localhost:8000/docs`에서 확인할 수 있습니다.

### 2. 프론트엔드 (Frontend) 실행
별도의 프레임워크 빌드 과정 없이 `frontend` 폴더 내의 `index.html` 파일을 브라우저로 직접 열거나, VSCode의 **Live Server** 확장을 통해 실행할 수 있습니다.
```bash
# Live Server 사용 시 
frontend 폴더에서 index.html 우클릭 -> "Open with Live Server" 클릭
```

## 📁 프로젝트 구조 (Project Structure)
- `/backend`: FastAPI 기반의 API 서버, 데이터베이스 모델(`models.py`), AI 분석 로직(`ai_service.py`), 웹소켓 통신 코드 등
- `/frontend`: 사용자 UI, 컴포넌트(`components/`), 스타일시트(`index.css`) 및 뷰 로직(`pages/home.js`)
