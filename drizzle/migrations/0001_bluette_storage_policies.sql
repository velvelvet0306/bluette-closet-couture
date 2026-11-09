CREATE POLICY "Users read own closet photos" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('closet-photos', 'avatars') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users upload own closet photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('closet-photos', 'avatars') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own closet photos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('closet-photos', 'avatars') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own closet photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('closet-photos', 'avatars') AND (storage.foldername(name))[1] = auth.uid()::text);