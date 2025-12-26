-- ========================================
-- posts 테이블 생성
-- ========================================
-- 집사 커뮤니티 게시판 테이블

CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- 인덱스 생성
-- ========================================
-- 작성자별 게시글 조회를 위한 인덱스
CREATE INDEX idx_posts_user_id ON posts(user_id);

-- 최신글 조회를 위한 인덱스
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- 제목 검색을 위한 인덱스 (LIKE 검색용)
CREATE INDEX idx_posts_title ON posts(title);

-- ========================================
-- updated_at 자동 업데이트 트리거
-- ========================================
-- updated_at 컬럼을 자동으로 업데이트하는 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
