-- =====================================================
-- Supabase Storage Buckets Configuration
-- =====================================================
-- Purpose: Storage buckets for Fulfillment v5 attachments
-- Date: 2025-10-29
-- =====================================================

-- =====================================================
-- 1. CREATE BUCKETS
-- =====================================================

-- Attachments bucket (private by default)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments',
  FALSE, -- Private bucket
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'audio/mpeg',
    'audio/wav',
    'video/mp4',
    'video/quicktime'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Avatars bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  TRUE, -- Public bucket
  5242880, -- 5MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Exports bucket (private, for data exports)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exports',
  'exports',
  FALSE, -- Private bucket
  104857600, -- 100MB limit
  ARRAY[
    'application/json',
    'application/zip',
    'text/csv',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. STORAGE RLS POLICIES
-- =====================================================

-- Attachments: Users can upload/read their own files
CREATE POLICY "Users can upload attachments" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Users can read own attachments" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Users can update own attachments" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  )
  WITH CHECK (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Users can delete own attachments" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Avatars: Users can upload/read their own avatar
CREATE POLICY "Users can upload avatar" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Anyone can read avatars" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Exports: Users can upload/read their own exports
CREATE POLICY "Users can upload exports" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'exports'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Users can read own exports" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'exports'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Users can delete own exports" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'exports'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- =====================================================
-- 3. HELPER FUNCTIONS
-- =====================================================

-- Generate a signed URL for an attachment
CREATE OR REPLACE FUNCTION fn_generate_attachment_url(
  p_attachment_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_path TEXT;
  v_url TEXT;
BEGIN
  SELECT storage_path INTO v_path
  FROM public.attachments
  WHERE id = p_attachment_id
    AND profile_id = auth.uid();

  IF v_path IS NULL THEN
    RETURN NULL;
  END IF;

  -- Generate signed URL (valid for 1 hour)
  -- Note: This is a placeholder. Actual implementation uses Supabase Storage API
  v_url := storage.url(v_path, 3600);

  RETURN v_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. STORAGE TRIGGERS
-- =====================================================

-- Automatically update attachment URL after upload
CREATE OR REPLACE FUNCTION fn_update_attachment_url()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.attachments
  SET url = fn_generate_attachment_url(NEW.id)
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_attachment_url
  AFTER INSERT ON public.attachments
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_attachment_url();

-- Track storage usage per profile
CREATE OR REPLACE FUNCTION fn_update_storage_usage()
RETURNS TRIGGER AS $$
DECLARE
  v_profile_id UUID;
  v_total_size BIGINT;
BEGIN
  -- Get profile_id from file path
  v_profile_id := (storage.foldername(NEW.name))[1]::UUID;

  -- Calculate total storage used
  SELECT COALESCE(SUM(metadata->>'size')::BIGINT, 0)
  INTO v_total_size
  FROM storage.objects
  WHERE (storage.foldername(name))[1] = v_profile_id::TEXT;

  -- Update profile preferences with storage usage
  UPDATE public.profiles
  SET preferences = jsonb_set(
    COALESCE(preferences, '{}'::JSONB),
    '{storage_used}',
    to_jsonb(v_total_size)
  )
  WHERE id = v_profile_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_storage_usage
  AFTER INSERT OR UPDATE OR DELETE ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_storage_usage();

-- =====================================================
-- CONFIGURATION COMPLETE
-- =====================================================

COMMENT ON SCHEMA storage IS 'Supabase Storage with RLS for Fulfillment v5';
