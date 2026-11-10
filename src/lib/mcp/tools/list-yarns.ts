import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";
import { YARNS } from "@/lib/yarn-palette";

export default defineTool({
  name: "list_yarns",
  title: "List my yarn stash",
  description: "List the yarns in the signed-in maker's stash: colour, brand, weight and hook size.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_args, ctx) => {
    const { data, error } = await supabaseForUser(ctx)
      .from("maker_yarns").select("id, color_id, brand, yarn_weight, hook_size").eq("user_id", ctx.getUserId() ?? "").limit(200);
    if (error) throw new ToolError(error.message);
    const yarns = (data ?? []).map((y) => ({
      id: y.id,
      color: YARNS.find((c) => c.id === y.color_id)?.name ?? y.color_id,
      brand: y.brand, weight: y.yarn_weight, hook: y.hook_size,
    }));
    return {
      content: [{ type: "text", text: yarns.length ? yarns.map((y) => `${y.color} — ${y.brand || "no brand"}, ${y.weight}, ${y.hook}`).join("\n") : "Stash is empty." }],
      structuredContent: { yarns },
    };
  },
});
