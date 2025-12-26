// Supabase 클라이언트 설정
const SUPABASE_URL = 'https://mfmdzwulskocwqobwpfj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mbWR6d3Vsc2tvY3dxb2J3cGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MDc4ODgsImV4cCI6MjA4MjI4Mzg4OH0.G_jAIO3KFyLY81qMVOa6ghcj2SDOZg3tYz749J29-8w';

// Supabase 클라이언트 생성 (전역 변수로 설정)
if (!window.supabaseClient) {
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// 전역 변수로 참조
var supabase = window.supabaseClient;
