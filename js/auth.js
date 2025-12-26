// 인증 관련 함수들

// 회원가입 함수
async function signUp(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('회원가입 오류:', error.message);
    return { success: false, error: error.message };
  }
}

// 로그인 함수
async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('로그인 오류:', error.message);
    return { success: false, error: error.message };
  }
}

// 로그아웃 함수
async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('로그아웃 오류:', error.message);
    return { success: false, error: error.message };
  }
}

// 현재 로그인한 사용자 정보 가져오기
async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) throw error;

    return user;
  } catch (error) {
    console.error('사용자 정보 가져오기 오류:', error.message);
    return null;
  }
}

// 로그인 상태 확인 함수
async function checkAuth() {
  const user = await getCurrentUser();
  return user !== null;
}

// 로그인 상태 변경 감지 (실시간)
function onAuthStateChange(callback) {
  supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
