// 로그인 페이지 로직

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', () => {
  // 이미 로그인되어 있다면 메인 페이지로 리다이렉트
  checkAuthAndRedirect();

  // 로그인 폼 제출 이벤트
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', handleLogin);

  // 회원가입 링크 클릭 이벤트
  const signupLink = document.getElementById('signupLink');
  signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    openSignupModal();
  });

  // 회원가입 모달 닫기 버튼
  const closeModalBtn = document.querySelector('.close-modal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeSignupModal);
  }

  // 모달 바깥 클릭 시 닫기
  const modal = document.getElementById('signupModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeSignupModal();
      }
    });
  }

  // 회원가입 폼 제출 이벤트
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }
});

// 로그인 처리
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // 로딩 상태 표시
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = '로그인 중...';
  submitBtn.disabled = true;

  // 로그인 실행
  const result = await signIn(email, password);

  if (result.success) {
    alert('로그인 성공!');
    window.location.href = 'index.html';
  } else {
    alert(`로그인 실패: ${result.error}`);
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// 회원가입 처리
async function handleSignup(e) {
  e.preventDefault();

  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // 비밀번호 확인
  if (password !== confirmPassword) {
    alert('비밀번호가 일치하지 않습니다.');
    return;
  }

  // 비밀번호 길이 확인 (최소 6자)
  if (password.length < 6) {
    alert('비밀번호는 최소 6자 이상이어야 합니다.');
    return;
  }

  // 로딩 상태 표시
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = '가입 중...';
  submitBtn.disabled = true;

  // 회원가입 실행
  const result = await signUp(email, password);

  if (result.success) {
    alert('회원가입 성공! 이메일을 확인해주세요.');
    closeSignupModal();
    // 폼 초기화
    document.getElementById('signupForm').reset();
  } else {
    alert(`회원가입 실패: ${result.error}`);
  }

  submitBtn.textContent = originalText;
  submitBtn.disabled = false;
}

// 로그인 상태 확인 및 리다이렉트
async function checkAuthAndRedirect() {
  const isLoggedIn = await checkAuth();
  if (isLoggedIn) {
    window.location.href = 'index.html';
  }
}

// 회원가입 모달 열기
function openSignupModal() {
  const modal = document.getElementById('signupModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

// 회원가입 모달 닫기
function closeSignupModal() {
  const modal = document.getElementById('signupModal');
  if (modal) {
    modal.style.display = 'none';
  }
}
