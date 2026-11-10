import { createServerFn } from "@tanstack/react-start";
import { DESCRIBE_SCHEMA, describePrompt, type DescribeResult } from "./describe-character";

export const describeCharacter = createServerFn({ method: "POST" })
  .inputValidator((input: { text: string }) => {
    const text = String(input?.text ?? "").trim();
    if (!text) throw new Error("Describe your character first.");
    if (text.length > 300) throw new Error("Keep the description under 300 characters.");
    return { text };
  })
  .handler(async ({ data }): Promise<{ result: DescribeResult | null; error: string | null }> => {
    const key = process.env["OPENAI_API_KEY"];
    if (!key) return { result: null, error: "The AI helper isn't set up yet." };
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: describePrompt() }, { role: "user", content: data.text }],
          response_format: { type: "json_schema", json_schema: { name: "character", strict: true, schema: DESCRIBE_SCHEMA } },
        }),
      });
      if (!res.ok) {
        console.error("OpenAI error", res.status, await res.text());
        return { result: null, error: res.status === 429 ? "The AI is busy or out of credit. Try again shortly." : "The AI couldn't read that description. Try again." };
      }
      const json = (await res.json()) as { choices?: { message?: { content?: string; refusal?: string } }[] };
      const content = json.choices?.[0]?.message?.content;
      if (!content) return { result: null, error: "The AI couldn't make that character. Try a different description." };
      return { result: JSON.parse(content) as DescribeResult, error: null };
    } catch (e) {
      console.error("describeCharacter failed", e);
      return { result: null, error: "Couldn't reach the AI. Try again." };
    }
  });
