import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_patterns",
  title: "List my patterns",
  description: "List the signed-in maker's saved crochet patterns (id, name, last saved).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_args, ctx) => {
    const { data, error } = await supabaseForUser(ctx)
      .from("patterns").select("id, name, saved_at").eq("user_id", ctx.getUserId() ?? "").order("saved_at", { ascending: false }).limit(100);
    if (error) throw new ToolError(error.message);
    const patterns = (data ?? []).map((p) => ({ id: p.id, name: p.name, savedAt: p.saved_at }));
    return {
      content: [{ type: "text", text: patterns.length ? patterns.map((p) => `${p.id}: ${p.name} (saved ${p.savedAt})`).join("\n") : "No saved patterns yet." }],
      structuredContent: { patterns },
    };
  },
});
