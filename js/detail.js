// 게시글 상세 페이지 로직

let currentPost = null;
let currentUser = null;

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', async () => {
  // 현재 사용자 정보 가져오기
  currentUser = await getCurrentUser();

  // URL에서 게시글 ID 가져오기
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');

  if (!postId) {
    alert('잘못된 접근입니다.');
    window.location.href = 'board.html';
    return;
  }

  // 게시글 로드
  await loadPost(postId);
});

// 게시글 로드
async function loadPost(postId) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error) throw error;

    if (!data) {
      alert('게시글을 찾을 수 없습니다.');
      window.location.href = 'board.html';
      return;
    }

    currentPost = data;

    // 조회수 증가
    await incrementViews(postId);

    // 게시글 렌더링
    renderPost(data);

  } catch (error) {
    console.error('게시글 로드 오류:', error.message);
    alert('게시글을 불러오는데 실패했습니다.');
    window.location.href = 'board.html';
  }
}

// 조회수 증가
async function incrementViews(postId) {
  try {
    const { error } = await supabase.rpc('increment_views', {
      post_id: postId
    });

    // RPC 함수가 없으면 직접 업데이트
    if (error) {
      await supabase
        .from('posts')
        .update({ views: currentPost.views + 1 })
        .eq('id', postId);
    }
  } catch (error) {
    console.error('조회수 증가 오류:', error.message);
  }
}

// 게시글 렌더링
function renderPost(post) {
  const postDetail = document.getElementById('postDetail');
  const buttonGroup = document.getElementById('buttonGroup');
  const rightButtons = document.getElementById('rightButtons');

  // 작성일 포맷팅
  const createdAt = formatDateTime(post.created_at);

  // 게시글 내용 렌더링
  postDetail.innerHTML = `
    <div class="post-header">
      <h1 class="post-title">${escapeHtml(post.title)}</h1>
      <div class="post-meta">
        <span>작성자: ${post.user_id.substring(0, 8)}</span>
        <span>작성일: ${createdAt}</span>
        <span>조회수: ${post.views + 1}</span>
      </div>
    </div>
    <div class="post-content">
      <div class="post-text">${escapeHtml(post.content)}</div>
      ${post.image_url ? `
        <div class="post-image">
          <img src="${post.image_url}" alt="게시글 이미지">
        </div>
      ` : ''}
    </div>
  `;

  // 버튼 표시
  buttonGroup.style.display = 'flex';

  // 본인 글이면 수정/삭제 버튼 표시
  if (currentUser && currentUser.id === post.user_id) {
    rightButtons.innerHTML = `
      <button class="btn-edit" onclick="editPost()">수정</button>
      <button class="btn-delete" onclick="deletePost()">삭제</button>
    `;
  }
}

// 게시글 수정
function editPost() {
  if (!currentPost) return;

  // 수정 페이지로 이동 (edit.html 또는 write.html에 수정 모드 추가)
  window.location.href = `edit.html?id=${currentPost.id}`;
}

// 게시글 삭제
async function deletePost() {
  if (!currentPost) return;

  if (!confirm('정말 삭제하시겠습니까?')) {
    return;
  }

  try {
    // 이미지가 있으면 삭제
    if (currentPost.image_url) {
      await deleteImage(currentPost.image_url);
    }

    // 게시글 삭제
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', currentPost.id);

    if (error) throw error;

    alert('게시글이 삭제되었습니다.');
    window.location.href = 'board.html';

  } catch (error) {
    console.error('게시글 삭제 오류:', error.message);
    alert('게시글 삭제에 실패했습니다.');
  }
}

// 이미지 삭제
async function deleteImage(imageUrl) {
  try {
    // URL에서 파일 경로 추출
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];

    const { error } = await supabase.storage
      .from('post-images')
      .remove([fileName]);

    if (error) {
      console.error('이미지 삭제 오류:', error.message);
    }
  } catch (error) {
    console.error('이미지 삭제 오류:', error.message);
  }
}

// 날짜/시간 포맷팅
function formatDateTime(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// HTML 이스케이프 (XSS 방지)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
