CREATE TABLE public.official_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  config jsonb NOT NULL,
  text text NOT NULL DEFAULT '',
  is_featured boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL,
  view_count integer NOT NULL DEFAULT 0,
  click_count integer NOT NULL DEFAULT 0,
  customize_count integer NOT NULL DEFAULT 0,
  download_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.official_patterns TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.official_patterns TO authenticated;
GRANT ALL ON public.official_patterns TO service_role;
ALTER TABLE public.official_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Featured readable by all" ON public.official_patterns FOR SELECT TO anon, authenticated USING (is_featured);
CREATE POLICY "Team reads all official" ON public.official_patterns FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Team inserts official" ON public.official_patterns FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')));
CREATE POLICY "Team updates official" ON public.official_patterns FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Team deletes official" ON public.official_patterns FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- Engagement counters: anyone may bump a featured pattern's counter, nothing else.
-- Team members' own clicks are ignored so stats reflect makers and visitors only.
CREATE OR REPLACE FUNCTION public.track_official_pattern(_id uuid, _kind text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')) THEN
    RETURN;
  END IF;
  UPDATE public.official_patterns SET
    view_count = view_count + (CASE WHEN _kind = 'view' THEN 1 ELSE 0 END),
    click_count = click_count + (CASE WHEN _kind = 'click' THEN 1 ELSE 0 END),
    customize_count = customize_count + (CASE WHEN _kind = 'customize' THEN 1 ELSE 0 END),
    download_count = download_count + (CASE WHEN _kind = 'download' THEN 1 ELSE 0 END)
  WHERE id = _id AND is_featured;
END $$;
REVOKE ALL ON FUNCTION public.track_official_pattern(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_official_pattern(uuid, text) TO anon, authenticated;