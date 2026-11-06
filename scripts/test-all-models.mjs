import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";

if (fs.existsSync(".env.local")) {
  const lines = fs.readFileSync(".env.local", "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq > 0) {
      const k = trimmed.slice(0, eq).trim();
      const v = trimmed.slice(eq + 1).trim();
      process.env[k] = v;
    }
  }
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const models = [
  "claude-3-haiku-20240307",
  "claude-3-sonnet-20240229",
  "claude-3-opus-20240229",
  "claude-2.1",
  "claude-instant-1.2"
];

for (const m of models) {
  try {
    const res = await anthropic.messages.create({
      model: m,
      max_tokens: 5,
      messages: [{ role: "user", content: "ping" }]
    });
    console.log(`Working model found: ${m}`);
    break;
  } catch (e) {
    console.log(`Model ${m}: ${e.status} - ${e.message}`);
  }
}
