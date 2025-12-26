// 게시판 페이지 로직

// 페이지네이션 변수
let currentPage = 1;
const postsPerPage = 10;
let totalPosts = 0;
let currentSearchKeyword = '';

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', () => {
  // 로그인 상태 확인 및 UI 업데이트
  updateAuthUI();

  // 게시글 목록 로드
  loadPosts();

  // 글쓰기 버튼 클릭 이벤트
  const writeBtn = document.querySelector('.btn-write');
  if (writeBtn) {
    writeBtn.addEventListener('click', handleWriteClick);
  }

  // 검색 버튼 클릭 이벤트
  const searchBtn = document.querySelector('.btn-search');
  if (searchBtn) {
    searchBtn.addEventListener('click', handleSearch);
  }

  // 검색 입력란 엔터키 이벤트
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    });
  }

  // 로그아웃 버튼 이벤트 리스너 (동적으로 추가될 수 있음)
  document.addEventListener('click', (e) => {
    if (e.target.closest('.logout-link')) {
      e.preventDefault();
      handleLogout();
    }
  });
});

// 로그인 상태에 따라 UI 업데이트
async function updateAuthUI() {
  const user = await getCurrentUser();
  const headerNav = document.querySelector('.header-nav');

  if (user) {
    // 로그인 상태: 로그아웃 링크로 변경
    const loginLink = headerNav.querySelector('a[href="login.html"]');
    if (loginLink) {
      loginLink.textContent = '로그아웃';
      loginLink.classList.add('logout-link');
      loginLink.removeAttribute('href');
      loginLink.style.cursor = 'pointer';
    }
  } else {
    // 로그아웃 상태: 로그인 링크로 유지
    const logoutLink = headerNav.querySelector('.logout-link');
    if (logoutLink) {
      logoutLink.textContent = '로그인';
      logoutLink.setAttribute('href', 'login.html');
      logoutLink.classList.remove('logout-link');
    }
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

// 글쓰기 버튼 클릭 처리
async function handleWriteClick() {
  const isLoggedIn = await checkAuth();

  if (!isLoggedIn) {
    alert('로그인이 필요합니다.');
    window.location.href = 'login.html';
    return;
  }

  // 글쓰기 페이지로 이동
  window.location.href = 'write.html';
}

// ========================================
// 게시글 CRUD 기능
// ========================================

// 게시글 목록 로드
async function loadPosts(searchKeyword = '') {
  try {
    currentSearchKeyword = searchKeyword;

    // 전체 게시글 수 가져오기
    let countQuery = supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    if (searchKeyword) {
      countQuery = countQuery.ilike('title', `%${searchKeyword}%`);
    }

    const { count, error: countError } = await countQuery;

    if (countError) throw countError;

    totalPosts = count || 0;

    // 페이지네이션을 적용한 게시글 가져오기
    const offset = (currentPage - 1) * postsPerPage;

    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + postsPerPage - 1);

    if (searchKeyword) {
      query = query.ilike('title', `%${searchKeyword}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    renderPosts(data);
    updatePagination();
  } catch (error) {
    console.error('게시글 로드 오류:', error.message);
    alert('게시글을 불러오는데 실패했습니다.');
  }
}

// 게시글 목록 렌더링
function renderPosts(posts) {
  const postList = document.getElementById('postList');

  if (!posts || posts.length === 0) {
    postList.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px;">
          게시글이 없습니다.
        </td>
      </tr>
    `;
    return;
  }

  postList.innerHTML = posts
    .map((post, index) => {
      // 전체 게시글 수 기준으로 번호 계산
      const displayNumber = totalPosts - ((currentPage - 1) * postsPerPage) - index;
      const userId = post.user_id.substring(0, 8); // user_id 앞 8자리만 표시
      const formattedDate = formatDate(post.created_at);

      return `
        <tr>
          <td>${displayNumber}</td>
          <td class="title-cell">
            <a href="detail.html?id=${post.id}">${escapeHtml(post.title)}</a>
          </td>
          <td>-</td>
          <td>${userId}</td>
          <td>${formattedDate}</td>
          <td>${post.views}</td>
        </tr>
      `;
    })
    .join('');
}

// 날짜 포맷팅
function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// HTML 이스케이프 (XSS 방지)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 검색 처리
function handleSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchKeyword = searchInput.value.trim();
  currentPage = 1; // 검색 시 첫 페이지로 이동
  loadPosts(searchKeyword);
}

// ========================================
// 페이지네이션 기능
// ========================================

// 페이지네이션 UI 업데이트
function updatePagination() {
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const pageInfo = document.querySelector('.page-info');
  const prevBtn = document.querySelector('.pagination .page-btn:first-child');
  const nextBtn = document.querySelector('.pagination .page-btn:last-child');

  // 페이지 정보 업데이트
  pageInfo.textContent = `${currentPage} page / ${totalPages || 1} pages`;

  // 이전 버튼 상태
  if (currentPage <= 1) {
    prevBtn.disabled = true;
    prevBtn.style.opacity = '0.5';
    prevBtn.style.cursor = 'not-allowed';
  } else {
    prevBtn.disabled = false;
    prevBtn.style.opacity = '1';
    prevBtn.style.cursor = 'pointer';
  }

  // 다음 버튼 상태
  if (currentPage >= totalPages) {
    nextBtn.disabled = true;
    nextBtn.style.opacity = '0.5';
    nextBtn.style.cursor = 'not-allowed';
  } else {
    nextBtn.disabled = false;
    nextBtn.style.opacity = '1';
    nextBtn.style.cursor = 'pointer';
  }

  // 버튼 이벤트 리스너 재설정
  prevBtn.onclick = () => goToPage(currentPage - 1);
  nextBtn.onclick = () => goToPage(currentPage + 1);
}

// 페이지 이동
function goToPage(page) {
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  if (page < 1 || page > totalPages) {
    return;
  }

  currentPage = page;
  loadPosts(currentSearchKeyword);

  // 페이지 상단으로 스크롤
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
