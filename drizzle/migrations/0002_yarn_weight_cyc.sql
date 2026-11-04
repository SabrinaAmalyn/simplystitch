-- Yarn weights now follow Craft Yarn Council's Standard Yarn Weight System (categories 0-7).
ALTER TABLE public.maker_preferences ALTER COLUMN yarn_weight SET DEFAULT '3 Light';
