// 글 수정 페이지 로직

let currentPost = null;
let selectedImage = null;
let originalImageUrl = null;
let isImageChanged = false;

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', async () => {
  // 로그인 확인
  await checkLoginStatus();

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

  // 폼 제출 이벤트
  const editForm = document.getElementById('editForm');
  editForm.addEventListener('submit', handleSubmit);

  // 이미지 선택 이벤트
  const imageInput = document.getElementById('image');
  imageInput.addEventListener('change', handleImageSelect);
});

// 로그인 상태 확인
async function checkLoginStatus() {
  const isLoggedIn = await checkAuth();

  if (!isLoggedIn) {
    alert('로그인이 필요합니다.');
    window.location.href = 'login.html';
  }
}

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

    // 본인 글인지 확인
    const user = await getCurrentUser();
    if (!user || user.id !== data.user_id) {
      alert('수정 권한이 없습니다.');
      window.location.href = 'board.html';
      return;
    }

    currentPost = data;
    originalImageUrl = data.image_url;

    // 폼에 데이터 채우기
    document.getElementById('title').value = data.title;
    document.getElementById('content').value = data.content;

    // 기존 이미지가 있으면 표시
    if (data.image_url) {
      showExistingImage(data.image_url);
    }

  } catch (error) {
    console.error('게시글 로드 오류:', error.message);
    alert('게시글을 불러오는데 실패했습니다.');
    window.location.href = 'board.html';
  }
}

// 기존 이미지 표시
function showExistingImage(imageUrl) {
  const preview = document.getElementById('imagePreview');
  preview.innerHTML = `
    <img src="${imageUrl}" alt="미리보기">
    <button type="button" class="remove-image" onclick="removeImage()">이미지 제거</button>
  `;
  preview.classList.add('active');
}

// 이미지 선택 처리
function handleImageSelect(e) {
  const file = e.target.files[0];

  if (!file) {
    if (isImageChanged) {
      selectedImage = null;
      hideImagePreview();
      isImageChanged = false;
    }
    return;
  }

  // 파일 크기 체크 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('이미지 파일은 5MB 이하만 업로드 가능합니다.');
    e.target.value = '';
    return;
  }

  // 이미지 파일 체크
  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 업로드 가능합니다.');
    e.target.value = '';
    return;
  }

  selectedImage = file;
  isImageChanged = true;
  showImagePreview(file);
}

// 이미지 미리보기 표시
function showImagePreview(file) {
  const preview = document.getElementById('imagePreview');
  const reader = new FileReader();

  reader.onload = (e) => {
    preview.innerHTML = `
      <img src="${e.target.result}" alt="미리보기">
      <button type="button" class="remove-image" onclick="removeImage()">이미지 제거</button>
    `;
    preview.classList.add('active');
  };

  reader.readAsDataURL(file);
}

// 이미지 미리보기 숨기기
function hideImagePreview() {
  const preview = document.getElementById('imagePreview');
  preview.innerHTML = '';
  preview.classList.remove('active');
}

// 이미지 제거
function removeImage() {
  selectedImage = null;
  isImageChanged = true;
  document.getElementById('image').value = '';
  hideImagePreview();
}

// 폼 제출 처리
async function handleSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const content = document.getElementById('content').value.trim();

  if (!title || !content) {
    alert('제목과 내용을 모두 입력해주세요.');
    return;
  }

  // 버튼 비활성화
  const submitBtn = e.target.querySelector('.btn-submit');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = '수정 중...';
  submitBtn.disabled = true;

  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('로그인 정보를 찾을 수 없습니다.');
    }

    let imageUrl = originalImageUrl;

    // 이미지가 변경되었으면
    if (isImageChanged) {
      // 기존 이미지 삭제
      if (originalImageUrl) {
        await deleteImage(originalImageUrl);
      }

      // 새 이미지 업로드
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage, user.id);
      } else {
        imageUrl = null;
      }
    }

    // 게시글 업데이트
    const { data, error } = await supabase
      .from('posts')
      .update({
        title: title,
        content: content,
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentPost.id)
      .select();

    if (error) throw error;

    alert('게시글이 수정되었습니다.');
    window.location.href = `detail.html?id=${currentPost.id}`;

  } catch (error) {
    console.error('게시글 수정 오류:', error.message);
    alert(`게시글 수정에 실패했습니다: ${error.message}`);

    // 버튼 활성화
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// 이미지 업로드
async function uploadImage(file, userId) {
  try {
    // 파일명 생성
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${timestamp}_${randomStr}.${fileExt}`;
    const filePath = `${fileName}`;

    // Storage에 업로드
    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(filePath, file);

    if (error) throw error;

    // Public URL 가져오기
    const { data: publicUrlData } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;

  } catch (error) {
    console.error('이미지 업로드 오류:', error.message);
    throw new Error('이미지 업로드에 실패했습니다.');
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
