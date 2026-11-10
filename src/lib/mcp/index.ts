import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listPatterns from "./tools/list-patterns";
import getPattern from "./tools/get-pattern";
import listYarns from "./tools/list-yarns";

// Vite inlines the stable ref; the published SUPABASE_URL may be a proxy.
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "simplystitch",
  title: "SimplyStitch",
  version: "0.1.0",
  instructions: "Read the signed-in maker's SimplyStitch amigurumi patterns and yarn stash. Use list_patterns then get_pattern for full text; list_yarns for the stash.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listPatterns, getPattern, listYarns],
});
