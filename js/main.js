// 메인 페이지 로직

// 슬라이더 변수
let currentSlide = 0;
let slideInterval;

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', () => {
  // 로그인 상태 확인 및 UI 업데이트
  updateAuthUI();

  // 슬라이더 초기화
  initSlider();

  // 햄버거 메뉴 초기화
  initHamburgerMenu();

  // 스크롤 애니메이션 초기화
  initScrollAnimation();

  // 로그아웃 버튼 이벤트 리스너 (동적으로 추가될 수 있음)
  document.addEventListener('click', (e) => {
    if (e.target.closest('.logout-btn')) {
      handleLogout();
    }
  });
});

// 로그인 상태에 따라 UI 업데이트
async function updateAuthUI() {
  const user = await getCurrentUser();
  const loginIcon = document.querySelector('.icon-login');

  if (user) {
    // 로그인 상태: 로그아웃 버튼으로 변경
    loginIcon.innerHTML = '<i class="fa-solid fa-user"></i>';
    loginIcon.setAttribute('aria-label', '로그아웃');
    loginIcon.classList.add('logout-btn');
    loginIcon.classList.remove('icon-login');
    loginIcon.removeAttribute('href');
    loginIcon.style.cursor = 'pointer';
  } else {
    // 로그아웃 상태: 로그인 링크로 유지
    loginIcon.innerHTML = '<i class="fa-regular fa-user"></i>';
    loginIcon.setAttribute('aria-label', '로그인');
    loginIcon.setAttribute('href', 'login.html');
    loginIcon.classList.add('icon-login');
    loginIcon.classList.remove('logout-btn');
  }
}

// 로그아웃 처리
async function handleLogout() {
  if (confirm('로그아웃 하시겠습니까?')) {
    const result = await signOut();

    if (result.success) {
      alert('로그아웃되었습니다.');
      window.location.reload();
    } else {
      alert(`로그아웃 실패: ${result.error}`);
    }
  }
}

// ========================================
// 슬라이더 기능
// ========================================

// 슬라이더 초기화
function initSlider() {
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.querySelector('.slider-controls .prev');
  const nextBtn = document.querySelector('.slider-controls .next');
  const dots = document.querySelectorAll('.dot');

  if (!slides.length) return;

  // 이전 버튼
  prevBtn.addEventListener('click', () => {
    changeSlide(currentSlide - 1);
    resetAutoSlide();
  });

  // 다음 버튼
  nextBtn.addEventListener('click', () => {
    changeSlide(currentSlide + 1);
    resetAutoSlide();
  });

  // Dot 클릭
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      changeSlide(index);
      resetAutoSlide();
    });
  });

  // 자동 슬라이드 시작
  startAutoSlide();
}

// 슬라이드 변경
function changeSlide(index) {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const slideCount = document.querySelector('.slide-count');

  if (index >= slides.length) {
    currentSlide = 0;
  } else if (index < 0) {
    currentSlide = slides.length - 1;
  } else {
    currentSlide = index;
  }

  // 모든 슬라이드 비활성화
  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));

  // 현재 슬라이드 활성화
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');

  // 카운트 업데이트
  slideCount.textContent = `${currentSlide + 1}/${slides.length}`;
}

// 자동 슬라이드 시작
function startAutoSlide() {
  slideInterval = setInterval(() => {
    changeSlide(currentSlide + 1);
  }, 5000); // 5초마다 자동 슬라이드
}

// 자동 슬라이드 리셋
function resetAutoSlide() {
  clearInterval(slideInterval);
  startAutoSlide();
}

// ========================================
// 햄버거 메뉴 기능
// ========================================

function initHamburgerMenu() {
  const hamburger = document.querySelector('.hamburger-menu');
  const nav = document.querySelector('.nav');

  if (!hamburger || !nav) return;

  hamburger.addEventListener('click', () => {
    nav.classList.toggle('active');
    hamburger.classList.toggle('active');
  });

  // 메뉴 외부 클릭 시 닫기
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
      nav.classList.remove('active');
      hamburger.classList.remove('active');
    }
  });
}

// ========================================
// 스크롤 애니메이션 기능
// ========================================

function initScrollAnimation() {
  const animateElements = document.querySelectorAll('.scroll-animate');

  if (!animateElements.length) return;

  // Intersection Observer 설정
  const observerOptions = {
    threshold: 0.1, // 요소의 10%가 보이면 트리거
    rootMargin: '0px 0px -50px 0px' // 하단에서 50px 전에 트리거
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        // 한 번 나타난 요소는 다시 관찰하지 않음
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // 모든 애니메이션 요소 관찰 시작
  animateElements.forEach(element => {
    observer.observe(element);
  });
}
