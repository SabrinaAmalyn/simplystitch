// ============= Full file contents =============

// Super admins create team accounts here: an email plus a temporary password,
// with the account forced to pick a real password at first sign-in.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { inviteError } from "./team-admin";

export const createTeamMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data, context }) => {
    const invalid = inviteError(data);
    if (invalid) throw new Error(invalid);

    // Only the super admin may add team accounts; checked against the protected roles table.
    const { data: isSuper } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!isSuper) throw new Error("Only the super admin can add team members.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email.trim(),
      password: data.password,
      email_confirm: true,
    });
    if (error || !created?.user) throw new Error(error?.message ?? "Couldn't create that account.");

    // Promote to admin through the super admin's own client (RLS allows exactly this insert).
    const { error: roleError } = await context.supabase
      .from("user_roles")
      .insert({ user_id: created.user.id, role: "admin" });
    if (roleError) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      throw new Error(roleError.message);
    }

    // Temporary password in use: the new admin must replace it at first sign-in.
    await supabaseAdmin
      .from("profiles")
      .update({ must_change_password: true })
      .eq("id", created.user.id);

    return { userId: created.user.id };
  });
