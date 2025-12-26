// 메인 페이지 로직

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', () => {
  // 로그인 상태 확인 및 UI 업데이트
  updateAuthUI();

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
