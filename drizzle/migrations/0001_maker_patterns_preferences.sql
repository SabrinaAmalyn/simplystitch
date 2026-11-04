CREATE TABLE public.patterns (
  id text PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  config jsonb NOT NULL,
  initial_text text NOT NULL DEFAULT '',
  text text NOT NULL DEFAULT '',
  history jsonb NOT NULL DEFAULT '[]'::jsonb,
  saved_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX patterns_user_id_idx ON public.patterns(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patterns TO authenticated;
GRANT ALL ON public.patterns TO service_role;
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Makers read own, team reads all" ON public.patterns FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Makers insert own" ON public.patterns FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Makers update own" ON public.patterns FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Makers delete own" ON public.patterns FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.maker_preferences (
  user_id uuid PRIMARY KEY,
  written_terms text NOT NULL DEFAULT 'US',
  yarn_weight text NOT NULL DEFAULT 'DK cotton',
  hook_size text NOT NULL DEFAULT '3.0 mm',
  favourite_yarns text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.maker_preferences TO authenticated;
GRANT ALL ON public.maker_preferences TO service_role;
ALTER TABLE public.maker_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prefs read own, team reads all" ON public.maker_preferences FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Prefs insert own" ON public.maker_preferences FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Prefs update own" ON public.maker_preferences FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());