-- ========================================
-- Storage 버킷 보안 정책
-- ========================================
-- post-images 버킷에 적용할 정책

-- 1. SELECT 정책: 누구나 이미지 조회 가능
CREATE POLICY "누구나 이미지를 조회할 수 있습니다"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'post-images');

-- 2. INSERT 정책: 로그인한 사용자만 이미지 업로드 가능
CREATE POLICY "로그인한 사용자만 이미지를 업로드할 수 있습니다"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'post-images'
    AND auth.role() = 'authenticated'
  );

-- 3. UPDATE 정책: 본인이 업로드한 이미지만 수정 가능
CREATE POLICY "본인이 업로드한 이미지만 수정할 수 있습니다"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'post-images'
    AND auth.uid() = owner
  )
  WITH CHECK (
    bucket_id = 'post-images'
    AND auth.uid() = owner
  );

-- 4. DELETE 정책: 본인이 업로드한 이미지만 삭제 가능
CREATE POLICY "본인이 업로드한 이미지만 삭제할 수 있습니다"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'post-images'
    AND auth.uid() = owner
  );
