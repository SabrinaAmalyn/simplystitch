import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { StashYarn } from "@/lib/maker-insights";

const STASH_FIELDS = "id, color_id, yarn_weight, hook_size, brand";

/** The signed-in maker's yarn stash: what they own, colour, weight, hook and brand. */
export function useMakerStash() {
  const { user } = useAuth();
  const [stash, setStash] = useState<StashYarn[]>([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("maker_yarns").select(STASH_FIELDS).eq("user_id", user.id).order("created_at");
    if (data) setStash(data as StashYarn[]);
    setReady(true);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const addYarn = useCallback(async (input: Omit<StashYarn, "id">) => {
    if (!user) { toast.error("Log in to save your yarns"); return false; }
    const { data, error } = await supabase
      .from("maker_yarns")
      .insert({ user_id: user.id, ...input, brand: input.brand.trim() })
      .select(STASH_FIELDS)
      .single();
    if (error || !data) { toast.error("Couldn't add that yarn"); return false; }
    setStash((s) => [...s, data as StashYarn]);
    return true;
  }, [user]);

  const removeYarn = useCallback(async (id: string) => {
    setStash((s) => s.filter((y) => y.id !== id));
    const { error } = await supabase.from("maker_yarns").delete().eq("id", id);
    if (error) toast.error("Couldn't remove that yarn");
  }, []);

  return { stash, ready, addYarn, removeYarn, reload: load };
}
