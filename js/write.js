// 글쓰기 페이지 로직

let selectedImage = null;

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', () => {
  // 로그인 확인
  checkLoginStatus();

  // 폼 제출 이벤트
  const writeForm = document.getElementById('writeForm');
  writeForm.addEventListener('submit', handleSubmit);

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

// 이미지 선택 처리
function handleImageSelect(e) {
  const file = e.target.files[0];

  if (!file) {
    selectedImage = null;
    hideImagePreview();
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
  submitBtn.textContent = '등록 중...';
  submitBtn.disabled = true;

  try {
    // 현재 로그인한 사용자 정보 가져오기
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('로그인 정보를 찾을 수 없습니다.');
    }

    let imageUrl = null;

    // 이미지 업로드
    if (selectedImage) {
      imageUrl = await uploadImage(selectedImage, user.id);
    }

    // 게시글 저장
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          title: title,
          content: content,
          image_url: imageUrl,
          user_id: user.id
        }
      ])
      .select();

    if (error) throw error;

    alert('게시글이 등록되었습니다.');
    window.location.href = 'board.html';

  } catch (error) {
    console.error('게시글 등록 오류:', error.message);
    alert(`게시글 등록에 실패했습니다: ${error.message}`);

    // 버튼 활성화
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// 이미지 업로드
async function uploadImage(file, userId) {
  try {
    // 파일명 생성 (timestamp + random)
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
