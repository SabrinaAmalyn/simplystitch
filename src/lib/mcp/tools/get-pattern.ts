import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_pattern",
  title: "Read a pattern",
  description: "Get the full written crochet pattern text for one of the maker's saved patterns.",
  inputSchema: { id: z.string().min(1).describe("Pattern id from list_patterns.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    const { data, error } = await supabaseForUser(ctx)
      .from("patterns").select("id, name, text, saved_at").eq("id", id).eq("user_id", ctx.getUserId() ?? "").maybeSingle();
    if (error) throw new ToolError(error.message);
    if (!data) throw new ToolError("No saved pattern with that id.");
    return {
      content: [{ type: "text", text: `# ${data.name}\n\n${data.text}` }],
      structuredContent: { pattern: { id: data.id, name: data.name, savedAt: data.saved_at, text: data.text } },
    };
  },
});
