CREATE TABLE public.maker_yarns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  color_id text NOT NULL,
  yarn_weight text NOT NULL DEFAULT '3 Light',
  hook_size text NOT NULL DEFAULT '3.0 mm',
  brand text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maker_yarns TO authenticated;
GRANT ALL ON public.maker_yarns TO service_role;
ALTER TABLE public.maker_yarns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Yarns read own, team reads all" ON public.maker_yarns FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Yarns insert own" ON public.maker_yarns FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Yarns update own" ON public.maker_yarns FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Yarns delete own" ON public.maker_yarns FOR DELETE TO authenticated USING (user_id = auth.uid());